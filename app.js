/**
 * NYU Visitor Registration Modern Front-End - Business Logic
 */

// Global State
const state = {
  theme: 'dark',
  buildings: [],
  history: [], // Previous guests: { first, last, email, count }
  registeredVisitors: [],
  isMockMode: false,
  sesstok: '',
  pid: '',
  uhash: '',
  pageId: '',
  maxDays: 90
};

const HOST_PHONE_STORAGE_KEY = 'nyu-visitor-host-phone';

let startCal, endCal;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Check if we are running in the live NYU environment or locally
function checkEnvironment() {
  const isLive = window.location.hostname.includes('identigy.io');
  state.isMockMode = !isLive;

  if (isLive) {
    refreshSessionTokens();
  } else {
    // Generate dummy tokens for local mockup
    state.sesstok = 'mock_sesstok_123456';
    state.pid = '51031';
    state.uhash = 'mock_uhash_abcdef';
    state.pageId = 'mock_pageid';
    state.maxDays = 90;
  }
}

function refreshSessionTokens() {
  state.sesstok = window.__sesstok || state.sesstok || '';
  state.pid = window.__pid || state.pid || '';
  state.uhash = window.__uhash || state.uhash || '';
  if (typeof window.__maxDays === 'number' && window.__maxDays > 0) {
    state.maxDays = window.__maxDays;
  }
  state.pageId = resolveFormPageId();
}

/** Portal form pageID (gPageID), NOT building.PAGEID / PERMSPAGEID. */
function resolveFormPageId() {
  const fromInput =
    document.querySelector('#original-identigy-content input[name="pageID"]') ||
    document.querySelector('input[name="pageID"]');
  return (
    window.gPageID ||
    (fromInput && fromInput.value) ||
    state.pageId ||
    ''
  );
}

function getBuildingId(building) {
  return (
    building.BUILDING_ID ||
    building.building_id ||
    building.BuildingID ||
    building.buildingId ||
    building.id ||
    ''
  );
}

function getBuildingName(building) {
  return (
    building.BUILDING_NAME ||
    building.building_name ||
    building.BuildingName ||
    building.name ||
    ''
  );
}

function addDaysISO(isoStr, days) {
  const [y, m, d] = isoStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toISO(dt);
}

function validateStayWindow(entryDateRaw, exitDateRaw) {
  if (exitDateRaw <= entryDateRaw) {
    return 'Departure time must be after arrival time';
  }
  const maxMs = state.maxDays * 24 * 60 * 60 * 1000;
  if (exitDateRaw.getTime() - entryDateRaw.getTime() > maxMs) {
    return `Visit length cannot exceed ${state.maxDays} days (JRNY limit)`;
  }
  return '';
}

function buildRegistrationPayload({
  first,
  last,
  email,
  visitorType,
  buildingId,
  buildingName,
  hostPhone,
  roomNotes = '',
  onBehalfOf = '',
  entryDateRaw,
  exitDateRaw
}) {
  refreshSessionTokens();
  const formPageId = resolveFormPageId();
  const tzOffsetHours = String(new Date().getTimezoneOffset() / 60);

  const payload = {
    action: 'Register',
    __sesstok: state.sesstok,
    first,
    last,
    local_VisitorType: visitorType,
    local_cdEmail: email,
    local_HostPhoneVisit: hostPhone,
    buildingID1: buildingId,
    buildingName1: buildingName,
    client_tz: tzOffsetHours,
    entryDate: formatApiDate(entryDateRaw),
    exitDate: formatApiDate(exitDateRaw)
  };

  if (formPageId) {
    payload['pageID[]'] = formPageId;
  }
  if (roomNotes) {
    payload.buildingRoomNumber1 = roomNotes;
  }
  if (onBehalfOf) {
    payload.local_onBehalfOfHost = onBehalfOf;
  }

  return payload;
}

// @standalone-bootstrap-start
document.addEventListener('DOMContentLoaded', () => {
  checkEnvironment();
  initTheme();
  initDatePickers();
  loadLocalStorageData();
  setupEventListeners();
  syncVisitors();
  fetchBuildings();
});
// @standalone-bootstrap-end

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('nyu-visitor-theme') || 'dark';
  state.theme = savedTheme;
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('moonIcon').style.display = 'none';
    document.getElementById('sunIcon').style.display = 'block';
  } else {
    document.body.classList.remove('light-theme');
    document.getElementById('moonIcon').style.display = 'block';
    document.getElementById('sunIcon').style.display = 'none';
  }
}

// Toggle light/dark theme
function toggleTheme() {
  if (state.theme === 'dark') {
    state.theme = 'light';
    document.body.classList.add('light-theme');
    document.getElementById('moonIcon').style.display = 'none';
    document.getElementById('sunIcon').style.display = 'block';
  } else {
    state.theme = 'dark';
    document.body.classList.remove('light-theme');
    document.getElementById('moonIcon').style.display = 'block';
    document.getElementById('sunIcon').style.display = 'none';
  }
  localStorage.setItem('nyu-visitor-theme', state.theme);
}

function formatDisplayDate(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDateInputValue(inputId) {
  const el = document.getElementById(inputId);
  return el.dataset.isoValue || el.value;
}

function createCalendarPicker(inputEl, opts = {}) {
  const wrapper = inputEl.closest('.date-input-wrapper');
  if (!wrapper) {
    console.warn('[NYU-ModernReg] date input missing .date-input-wrapper parent:', inputEl.id);
    return { setDate: () => {}, setMinDate: () => {}, setMaxDate: () => {}, getDate: () => '' };
  }

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedISO = opts.initial || '';
  let minISO = opts.minDate || '';
  let maxISO = opts.maxDate || '';
  let popup = null;
  let isOpen = false;
  let outsideHandler = null;

  function setDate(iso) {
    selectedISO = iso;
    inputEl.value = formatDisplayDate(iso);
    inputEl.dataset.isoValue = iso;
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setMinDate(iso) {
    minISO = iso;
    if (selectedISO && selectedISO < iso) {
      setDate(iso);
    }
  }

  function setMaxDate(iso) {
    maxISO = iso;
    if (selectedISO && maxISO && selectedISO > maxISO) {
      setDate(maxISO);
    }
  }

  function positionPopup() {
    if (!popup) return;
    const rect = inputEl.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.top = `${rect.bottom + 6}px`;
    popup.style.left = `${rect.left}px`;
    popup.style.zIndex = '10000000';
    popup.style.minWidth = `${Math.max(rect.width, 290)}px`;
  }

  function renderCalendar() {
    if (!popup) return;
        const todayISO = toISO(new Date());
        const minD = minISO || '';
        const maxD = maxISO || '';

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        let html = `<div class="cal-header">
          <button type="button" class="cal-prev">‹</button>
          <span class="cal-title">${MONTHS[currentMonth]} ${currentYear}</span>
          <button type="button" class="cal-next">›</button>
        </div>
        <div class="cal-grid">`;

        DAYS.forEach(d => { html += `<span class="cal-dow">${d}</span>`; });

        for (let i = firstDay - 1; i >= 0; i--) {
          const day = daysInPrevMonth - i;
          html += `<button type="button" class="cal-day other-month disabled" disabled>${day}</button>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
          const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const classes = [];
          if (iso === todayISO) classes.push('today');
          if (iso === selectedISO) classes.push('selected');
          const outOfRange = (minD && iso < minD) || (maxD && iso > maxD);
          if (outOfRange) classes.push('disabled');
          html += `<button type="button" class="cal-day ${classes.join(' ')}" data-iso="${iso}" ${outOfRange ? 'disabled' : ''}>${day}</button>`;
        }

    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      html += `<button type="button" class="cal-day other-month disabled" disabled>${i}</button>`;
    }

    html += '</div>';
    popup.innerHTML = html;

    popup.querySelector('.cal-prev').addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar();
    });
    popup.querySelector('.cal-next').addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderCalendar();
    });
    popup.querySelectorAll('.cal-day:not(.disabled)').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDate(btn.dataset.iso);
        close();
      });
    });
  }

  function detachOutsideHandler() {
    if (outsideHandler) {
      document.removeEventListener('mousedown', outsideHandler, true);
      outsideHandler = null;
    }
  }

  function close() {
    detachOutsideHandler();
    if (popup) {
      popup.remove();
      popup = null;
    }
    isOpen = false;
  }

  function open() {
    if (isOpen) return;

    document.querySelectorAll('.calendar-popup').forEach(p => p.remove());
    detachOutsideHandler();

    popup = document.createElement('div');
    popup.className = 'calendar-popup';
    document.body.appendChild(popup);

    if (selectedISO) {
      const [y, m] = selectedISO.split('-').map(Number);
      currentYear = y;
      currentMonth = m - 1;
    }

    renderCalendar();
    positionPopup();
    isOpen = true;

    outsideHandler = (e) => {
      if (wrapper.contains(e.target) || popup.contains(e.target)) return;
      close();
    };
    setTimeout(() => {
      document.addEventListener('mousedown', outsideHandler, true);
    }, 0);
  }

  const openFromInput = (e) => {
    e.preventDefault();
    e.stopPropagation();
    open();
  };

  inputEl.addEventListener('mousedown', openFromInput);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      openFromInput(e);
    }
  });

  window.addEventListener('resize', () => {
    if (isOpen) positionPopup();
  });
  window.addEventListener('scroll', () => {
    if (isOpen) positionPopup();
  }, true);

  return { setDate, setMinDate, setMaxDate, getDate: () => selectedISO, close };
}

function initDatePickers() {
  const todayISO = toISO(new Date());
  const maxISO = addDaysISO(todayISO, state.maxDays);

  startCal = createCalendarPicker(document.getElementById('startDate'), {
    initial: todayISO,
    minDate: todayISO,
    maxDate: maxISO
  });
  endCal = createCalendarPicker(document.getElementById('endDate'), {
    initial: todayISO,
    minDate: todayISO,
    maxDate: maxISO
  });
  startCal.setDate(todayISO);
  endCal.setDate(todayISO);

  document.getElementById('startDate').addEventListener('change', () => {
    const newStart = document.getElementById('startDate').dataset.isoValue;
    if (newStart) {
      const startMax = addDaysISO(newStart, state.maxDays);
      endCal.setMinDate(newStart);
      if (typeof endCal.setMaxDate === 'function') endCal.setMaxDate(startMax);
      endCal.setDate(newStart);
    }
  });
}

// Local Storage & History Caching
function loadLocalStorageData() {
  // Load guest history
  const savedHistory = localStorage.getItem('nyu-visitor-history');
  state.history = savedHistory ? JSON.parse(savedHistory) : [];
  renderQuickDupChips();

  const savedPhone = localStorage.getItem(HOST_PHONE_STORAGE_KEY) || '';
  const phoneEl = document.getElementById('hostPhone');
  if (phoneEl && savedPhone) phoneEl.value = savedPhone;

  // Load mock registrations if in mock mode
  if (state.isMockMode) {
    const savedRegs = localStorage.getItem('nyu-mock-registrations');
    state.registeredVisitors = savedRegs ? JSON.parse(savedRegs) : getMockRegisteredVisitors();
  }
}

function persistHostPhone(phone) {
  const trimmed = (phone || '').trim();
  if (trimmed) {
    localStorage.setItem(HOST_PHONE_STORAGE_KEY, trimmed);
  }
}

// Save registered guest to local cache history for autocompletion
function saveGuestToHistory(first, last, email, buildingName = '', buildingId = '', buildingPageId = '') {
  const emailLower = email.toLowerCase().trim();
  const existing = state.history.find(h => h.email.toLowerCase().trim() === emailLower);
  
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.first = first;
    existing.last = last;
    if (buildingName) {
      existing.buildingName = buildingName;
      existing.buildingId = buildingId;
      existing.buildingPageId = buildingPageId;
    }
  } else {
    state.history.push({
      first: first.trim(),
      last: last.trim(),
      email: emailLower,
      buildingName: buildingName || '',
      buildingId: buildingId || '',
      buildingPageId: buildingPageId || '',
      count: 1
    });
  }
  
  // Sort by count descending
  state.history.sort((a, b) => b.count - a.count);
  
  // Limit history length
  if (state.history.length > 20) {
    state.history = state.history.slice(0, 20);
  }
  
  localStorage.setItem('nyu-visitor-history', JSON.stringify(state.history));
  renderQuickDupChips();
}

// Render Quick Duplicator Chips
function renderQuickDupChips() {
  const container = document.getElementById('quickDupList');
  const section = document.getElementById('quickDupSection');
  
  if (!container || !section) return;
  
  if (state.history.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  container.innerHTML = '';
  
  // Show top 5 frequent guests
  state.history.slice(0, 5).forEach(guest => {
    const chip = document.createElement('div');
    chip.className = 'quick-dup-chip';
    chip.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
      <span>${guest.first} ${guest.last}</span>
    `;
    chip.addEventListener('click', () => populateFormWithGuest(guest));
    container.appendChild(chip);
  });
}

function appendGuestRow(first, last, email) {
  const paste = document.getElementById('guestPaste');
  if (!paste) return;
  const line = `${first} ${last}, ${email}`.trim();
  paste.value = paste.value.trim() ? `${paste.value.trim()}\n${line}` : line;
  paste.focus();
}

function populateFormWithGuest(guest) {
  appendGuestRow(guest.first, guest.last, guest.email);
  if (guest.buildingName) {
    const bInput = document.getElementById('buildingSearch');
    const bId = document.getElementById('buildingId');
    if (bInput && bId) {
      bInput.value = guest.buildingName;
      bId.value = guest.buildingId || '';
    }
  }
  showToast(`Added ${guest.first} ${guest.last} to the guest list`, 'success');
}

// Event Listeners Setup
function setupEventListeners() {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  document.getElementById('refreshList').addEventListener('click', () => {
    syncVisitors(true);
  });

  setupBuildingAutocomplete('buildingSearch', 'buildingId', 'buildingSuggestions');

  const phoneEl = document.getElementById('hostPhone');
  if (phoneEl) {
    phoneEl.addEventListener('change', () => persistHostPhone(phoneEl.value));
  }

  document.getElementById('btnRegister').addEventListener('click', handleRegisterSubmit);

  document.getElementById('visitorFilter').addEventListener('input', (e) => {
    renderVisitorList(e.target.value);
  });
}

// Building Autocomplete Setup
function setupBuildingAutocomplete(inputId, idHolderId, suggestionsId) {
  const input = document.getElementById(inputId);
  const idHolder = document.getElementById(idHolderId);
  const suggestionsBox = document.getElementById(suggestionsId);

  function tryResolveBuilding() {
    const val = input.value.trim().toLowerCase();
    if (!val || idHolder.value) return;

    if (state.buildings.length === 0 && window.gBuildingData && window.gBuildingData.length > 0) {
      state.buildings = window.gBuildingData;
    }

    const anyFieldMatch = (b, sv, exact) => {
      for (const key of Object.keys(b)) {
        const v = b[key];
        if (typeof v === 'string') {
          if (exact ? v.toLowerCase() === sv : v.toLowerCase().includes(sv)) return true;
        }
      }
      return false;
    };

    const resolveFromEntry = (b) => {
      input.value = getBuildingName(b) || input.value;
      idHolder.value = getBuildingId(b);
    };

    const exact = state.buildings.find(b => anyFieldMatch(b, val, true));
    if (exact) {
      resolveFromEntry(exact);
      return;
    }

    const partials = state.buildings.filter(b => anyFieldMatch(b, val, false));
    if (partials.length === 1) {
      resolveFromEntry(partials[0]);
    } else if (partials.length > 1) {
      resolveFromEntry(partials[0]);
    }
  }

  input.addEventListener('input', () => {
    idHolder.value = '';

    const val = input.value.trim().toLowerCase();
    if (val.length < 2) {
      suggestionsBox.style.display = 'none';
      return;
    }

    if (state.buildings.length === 0) {
      if (window.gBuildingData && window.gBuildingData.length > 0) {
        state.buildings = window.gBuildingData;
      } else {
        fetchBuildings();
      }
    }

    const matches = state.buildings.filter(b => {
      for (const key of Object.keys(b)) {
        const v = b[key];
        if (typeof v === 'string' && v.toLowerCase().includes(val)) return true;
      }
      return false;
    }).slice(0, 6);

    if (matches.length === 0) {
      suggestionsBox.style.display = 'none';
      return;
    }

    suggestionsBox.innerHTML = '';
    suggestionsBox.style.display = 'block';

    matches.forEach(building => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';

      const name = getBuildingName(building);
      const bldgId = getBuildingId(building);
      const addr = building.ADDRESS_SIMPLE || building.ADDRESS_ALT || building.address || '';
      const escapedVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedVal})`, 'gi');
      const displayText = name || addr || JSON.stringify(building).substring(0, 60);
      const highlighted = displayText.replace(regex, '<strong>$1</strong>');
      const secondaryInfo = name ? (addr ? addr.split(' OR ')[0] : `ID: ${bldgId}`) : `ID: ${bldgId}`;
      div.innerHTML = `${highlighted} <span style="font-size: 0.75rem; color: var(--text-muted); float: right;">${secondaryInfo}</span>`;

      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = name || addr.split(' OR ')[0];
        idHolder.value = bldgId;
        suggestionsBox.style.display = 'none';
      });
      suggestionsBox.appendChild(div);
    });
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      suggestionsBox.style.display = 'none';
      tryResolveBuilding();
    }, 200);
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });
}

// API: Fetch Buildings
async function fetchBuildings() {
  // Try to resolve from window.gBuildingData first
  if (window.gBuildingData && window.gBuildingData.length > 0) {
    state.buildings = window.gBuildingData;
    console.log('[NYU-ModernReg] Resolved buildings from window.gBuildingData:', state.buildings.length);
    return;
  }

  if (state.isMockMode) {
    state.buildings = getMockBuildings();
    return;
  }

  try {
    refreshSessionTokens();

    const resolvedPageID = resolveFormPageId() || '-1';

    const payload = {
      __sesstok: state.sesstok,
      action: 'getBuildingList',
      pid: state.pid,
      iug: window.__iug || '0',
      pageID: resolvedPageID
    };

    const response = await fetch('/common/local_vm_data.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      state.buildings = Array.isArray(data) ? data : [];
      if (state.buildings.length) {
        window.gBuildingData = state.buildings;
      }
      console.log('[NYU-ModernReg] Successfully fetched buildings:', state.buildings.length);
    } else {
      console.error('[NYU-ModernReg] Failed to fetch buildings:', response.status);
      state.buildings = [];
    }
  } catch (err) {
    console.error('[NYU-ModernReg] Error fetching buildings:', err);
    state.buildings = [];
  }
}

// API: Sync Visitors list (pulls from hidden table in backend wrapper page)
async function syncVisitors(showNotification = false) {
  if (state.isMockMode) {
    renderVisitorList();
    if (showNotification) showToast('Visitors synced successfully (Local Database)', 'success');
    return;
  }

  try {
    // If in Live mode, parse visitor data from globals or hidden DOM
    const visitors = [];

    const globalVisitors = window.__visitors || (window.unsafeWindow && window.unsafeWindow.__visitors);
    if (globalVisitors && Array.isArray(globalVisitors.expected)) {
      globalVisitors.expected.forEach(v => {
        const historyMatch = state.history.find(h =>
          h.first.toLowerCase() === (v.FIRSTNAME || '').toLowerCase() &&
          h.last.toLowerCase() === (v.LASTNAME || '').toLowerCase()
        );

        visitors.push({
          visitid: v.VISITID || Math.random().toString(36).substring(7),
          first: v.FIRSTNAME || '',
          last: v.LASTNAME || '',
          email: historyMatch ? historyMatch.email : '',
          buildingName: historyMatch ? historyMatch.buildingName : 'NYU Building',
          entryDateStr: v.ENTRY_DATE || 'Active',
          exitDateStr: v.EXIT_DATE || 'Active',
          status: 'Registered'
        });
      });
      state.registeredVisitors = visitors;
    } else {
      const hiddenArea = document.getElementById('original-identigy-content') || document;
      const rows = hiddenArea.querySelectorAll('.visitorRow, tr[id^="visitor_"], .card:not(.edit):not(.loading)');
    if (rows && rows.length > 0) {
      rows.forEach(row => {
        // Search inside row cells
        const nameCell = row.querySelector('.visitorName, td:nth-child(2), h3, .name');
        const emailCell = row.querySelector('.visitorEmail, td:nth-child(3), .email');
        const buildingCell = row.querySelector('.visitorBuilding, td:nth-child(4), .building');
        const startCell = row.querySelector('.visitorStart, td:nth-child(5), .start, .arrival');
        const endCell = row.querySelector('.visitorEnd, td:nth-child(6), .end, .departure');
        
        // Grab visit ID from attribute if available
        let visitid = row.getAttribute('data-visitid') || row.id.replace('visitor_', '');
        if (!visitid || visitid === row.id) {
          // Look for checkout buttons or edit buttons to parse ID
          const actionBtn = row.querySelector('[onclick*="Checkout"], [onclick*="Unregister"], [data-visitid]');
          if (actionBtn) {
            visitid = actionBtn.getAttribute('data-visitid') || 
                      actionBtn.getAttribute('onclick').match(/\d+/)?.[0] || 
                      '';
          }
        }
        
        if (nameCell && nameCell.textContent.trim()) {
          const fullName = nameCell.textContent.trim();
          const nameParts = fullName.split(/\s+/);
          const first = nameParts[0] || '';
          const last = nameParts.slice(1).join(' ') || '';
          
          visitors.push({
            visitid: visitid || Math.random().toString(36).substring(7),
            first: first,
            last: last,
            email: emailCell ? emailCell.textContent.trim() : '',
            buildingName: buildingCell ? buildingCell.textContent.trim() : 'NYU Building',
            entryDateStr: startCell ? startCell.textContent.trim() : 'Active',
            exitDateStr: endCell ? endCell.textContent.trim() : 'Active',
            status: 'Registered'
          });
        }
      });
      state.registeredVisitors = visitors;
    } else {
      console.log('No visitor list rows found in DOM.');
    }
    }
    
    renderVisitorList();
    if (showNotification) showToast(`Synced ${state.registeredVisitors.length} visitors from NYU portal`, 'success');
  } catch (err) {
    console.error('Error parsing visitor list:', err);
    if (showNotification) showToast('Failed to sync visitor list', 'error');
  }
}

// API: Register Guest (Form Submit)
async function registerGuest(guestData) {
  if (state.isMockMode) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Add to mock state
    const newVisitId = 'mock_visit_' + Date.now() + Math.floor(Math.random()*1000);
    const newGuest = {
      visitid: newVisitId,
      first: guestData.first,
      last: guestData.last,
      email: guestData.local_cdEmail,
      buildingName: guestData.buildingName1,
      buildingId: guestData.buildingID1,
      entryDateStr: formatDisplayDateTime(guestData.entryDate),
      exitDateStr: formatDisplayDateTime(guestData.exitDate),
      status: 'Registered'
    };
    
    state.registeredVisitors.unshift(newGuest);
    localStorage.setItem('nyu-mock-registrations', JSON.stringify(state.registeredVisitors));
    return { success: true, message: 'Mock Registration Successful' };
  }

  // Live endpoint registration request
  try {
    refreshSessionTokens();
    if (guestData.__sesstok !== state.sesstok && state.sesstok) {
      guestData.__sesstok = state.sesstok;
    }

    const params = new URLSearchParams();
    for (const key in guestData) {
      const val = guestData[key];
      if (val === undefined || val === null) continue;
      if (Array.isArray(val)) {
        val.forEach((item) => params.append(key, item));
      } else {
        params.append(key, val);
      }
    }

    const response = await fetch('/patron/VisitorManagement/visitorshost_save.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: params.toString()
    });

    const resultText = await response.text();
    // IDENTIGY sometimes prefixes JSON with an HTML marker
    const jsonText = resultText.includes('<!-- RESULT -->')
      ? resultText.slice(resultText.indexOf('<!-- RESULT -->') + '<!-- RESULT -->'.length)
      : resultText;

    let resultJson = null;
    try {
      resultJson = JSON.parse(jsonText.trim());
    } catch (e) {
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status} Error` };
      }
      // Non-JSON bodies are only treated as success for known redirect/script replies.
      // Do not match loose words like "visitor" — error HTML pages often contain them.
      const trimmed = resultText.trim();
      if (/location\.href\s*=/i.test(trimmed) || /window\.location\s*=/i.test(trimmed)) {
        return { success: true };
      }
      return {
        success: false,
        error: 'Unexpected server response (registration may not have completed)'
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: resultJson.Error || resultJson.error || resultJson.AlertMsg || `HTTP ${response.status} Error`
      };
    }

    // Match IDENTIGY requestJson semantics: Error / AlertMsg reject; Redirect navigates.
    if (resultJson.Error || resultJson.error) {
      return { success: false, error: resultJson.Error || resultJson.error };
    }
    if (resultJson.AlertMsg) {
      return { success: false, error: resultJson.AlertMsg };
    }
    if (resultJson.success === false) {
      return { success: false, error: resultJson.message || 'Server rejected registration' };
    }
    return { success: true };
  } catch (err) {
    console.error('[NYU-ModernReg] Registration failed:', err);
    return { success: false, error: err.message };
  }
}

// API: Unregister / Cancel Guest
async function deleteGuest(visitid) {
  if (state.isMockMode) {
    state.registeredVisitors = state.registeredVisitors.filter(v => v.visitid !== visitid);
    localStorage.setItem('nyu-mock-registrations', JSON.stringify(state.registeredVisitors));
    renderVisitorList();
    showToast('Visitor registration cancelled', 'success');
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append('action', 'Unregister');
    params.append('visitid', visitid);
    params.append('__sesstok', state.sesstok);

    const response = await fetch('/patron/VisitorManagement/visitorshost_save.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: params.toString()
    });

    if (response.ok) {
      showToast('Visitor registration cancelled successfully', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showToast('Failed to cancel registration', 'error');
    }
  } catch (err) {
    console.error('Unregister request failed:', err);
    showToast('Failed to cancel registration', 'error');
  }
}

// API: Checkout Guest early
async function checkoutGuest(visitid, guestObj) {
  if (state.isMockMode) {
    const guest = state.registeredVisitors.find(v => v.visitid === visitid);
    if (guest) {
      guest.exitDateStr = formatDisplayDateTime(formatApiDate(new Date()));
      localStorage.setItem('nyu-mock-registrations', JSON.stringify(state.registeredVisitors));
      renderVisitorList();
      showToast('Checked out visitor early', 'success');
    }
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append('action', 'Register');
    params.append('do', 'Checkout');
    params.append('visitid', visitid);
    params.append('__sesstok', state.sesstok);
    params.append('exitDate', formatApiDate(new Date()));

    const response = await fetch('/patron/VisitorManagement/visitorshost_save.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: params.toString()
    });

    if (response.ok) {
      showToast('Visitor checked out', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showToast('Checkout failed', 'error');
    }
  } catch (err) {
    console.error('Checkout failed:', err);
    showToast('Checkout failed', 'error');
  }
}

function ensureBuildingSelected(searchInputId, idHolderId) {
  const buildingName = document.getElementById(searchInputId).value.trim();
  let buildingId = document.getElementById(idHolderId).value;

  if (!buildingId) {
    if (state.buildings.length === 0 && window.gBuildingData && window.gBuildingData.length > 0) {
      state.buildings = window.gBuildingData;
    }
    const searchVal = buildingName.toLowerCase();
    const matchField = (b, exact) => {
      for (const key of Object.keys(b)) {
        const v = b[key];
        if (typeof v !== 'string') continue;
        const lv = v.toLowerCase();
        if (exact ? lv === searchVal : lv.includes(searchVal)) return true;
      }
      return false;
    };
    const exact = state.buildings.find((b) => matchField(b, true));
    const pick = exact || (() => {
      const partials = state.buildings.filter((b) => matchField(b, false));
      return partials.length === 1 ? partials[0] : null;
    })();
    if (pick) {
      buildingId = getBuildingId(pick);
      document.getElementById(searchInputId).value = getBuildingName(pick) || buildingName;
      document.getElementById(idHolderId).value = buildingId;
    }
  }

  return {
    buildingId,
    buildingName: document.getElementById(searchInputId).value.trim()
  };
}

// Form Handler: multi-guest registration (also works for a single row)
async function handleRegisterSubmit() {
  const pasteData = document.getElementById('guestPaste').value.trim();
  const visitorType = document.getElementById('visitorType').value;
  const hostPhone = (document.getElementById('hostPhone')?.value || '').trim();
  const roomNotes = (document.getElementById('roomNotes')?.value || '').trim();
  const onBehalfOf = (document.getElementById('onBehalfOf')?.value || '').trim();

  if (!pasteData) {
    showToast('Please paste at least one guest row', 'error');
    return;
  }

  if (!hostPhone) {
    showToast('Host phone number is required by NYU JRNY', 'error');
    return;
  }

  if (state.buildings.length === 0) {
    if (window.gBuildingData && window.gBuildingData.length > 0) {
      state.buildings = window.gBuildingData;
    } else {
      await fetchBuildings();
    }
  }

  const { buildingId, buildingName } = ensureBuildingSelected('buildingSearch', 'buildingId');
  if (!buildingId) {
    showToast('Please select an NYU building from the suggestions', 'error');
    return;
  }

  if (!resolveFormPageId() && !state.isMockMode) {
    showToast('Portal session page ID missing — refresh the NYU page and try again', 'error');
    return;
  }

  const startDate = getDateInputValue('startDate');
  const startTime = document.getElementById('startTime').value;
  const endDate = getDateInputValue('endDate');
  const endTime = document.getElementById('endTime').value;

  const entryDateRaw = new Date(`${startDate}T${startTime}`);
  const exitDateRaw = new Date(`${endDate}T${endTime}`);

  const stayError = validateStayWindow(entryDateRaw, exitDateRaw);
  if (stayError) {
    showToast(stayError, 'error');
    return;
  }

  const guests = parseBulkText(pasteData);
  if (guests.length === 0) {
    showToast('Could not parse any guest rows. Verify format.', 'error');
    return;
  }

  const queueContainer = document.getElementById('guestQueue');
  queueContainer.innerHTML = '';
  queueContainer.style.display = 'block';

  const queueItems = guests.map((guest, idx) => {
    const div = document.createElement('div');
    div.className = 'queue-item';
    div.innerHTML = `
      <span>${idx + 1}. <strong>${guest.first} ${guest.last}</strong> (${guest.email})</span>
      <span class="queue-status status-pending" id="queue-${idx}">Pending</span>
    `;
    queueContainer.appendChild(div);
    return { ...guest, statusSpanId: `queue-${idx}` };
  });

  persistHostPhone(hostPhone);
  showToast(`Registering ${guests.length} visitor${guests.length === 1 ? '' : 's'}...`, 'info');

  let successCount = 0;
  for (let i = 0; i < queueItems.length; i++) {
    const item = queueItems[i];
    const statusSpan = document.getElementById(item.statusSpanId);

    statusSpan.className = 'queue-status status-sending';
    statusSpan.innerHTML = 'Sending...';

    const payload = buildRegistrationPayload({
      first: item.first,
      last: item.last,
      email: item.email,
      visitorType,
      buildingId,
      buildingName,
      hostPhone,
      roomNotes,
      onBehalfOf,
      entryDateRaw,
      exitDateRaw
    });

    const res = await registerGuest(payload);

    if (res.success) {
      successCount += 1;
      statusSpan.className = 'queue-status status-success';
      statusSpan.innerHTML = '✓ Success';
      saveGuestToHistory(item.first, item.last, item.email, buildingName, buildingId, '');
    } else {
      statusSpan.className = 'queue-status status-failed';
      statusSpan.innerHTML = `✗ Failed: ${res.error || 'Server error'}`;
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  showToast(
    `Registration finished: ${successCount}/${guests.length} succeeded`,
    successCount === guests.length ? 'success' : 'warning'
  );
  document.getElementById('guestPaste').value = '';
  if (state.isMockMode) {
    syncVisitors();
  } else if (successCount > 0) {
    setTimeout(() => window.location.reload(), 1500);
  }
}

// Bulk text parser logic
function parseBulkText(text) {
  const lines = text.split('\n');
  const visitors = [];

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    let first = '', last = '', email = '';

    // Regex check for: "First Last <email@domain.com>"
    const angleBracketMatch = line.match(/^([^<]+)<([^>]+)>$/);
    
    // Regex check for: "First, Last, email@domain.com"
    const commaMatch = line.split(',');

    if (angleBracketMatch) {
      const nameParts = angleBracketMatch[1].trim().split(/\s+/);
      first = nameParts[0];
      last = nameParts.slice(1).join(' ');
      email = angleBracketMatch[2].trim();
    } else if (commaMatch && commaMatch.length >= 3) {
      first = commaMatch[0].trim();
      last = commaMatch[1].trim();
      email = commaMatch[2].trim();
    } else if (commaMatch && commaMatch.length === 2) {
      // Format: "First Last, email@domain.com"
      const nameParts = commaMatch[0].trim().split(/\s+/);
      first = nameParts[0];
      last = nameParts.slice(1).join(' ');
      email = commaMatch[1].trim();
    } else {
      // Basic space splitter: "First Last email@domain.com"
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        first = parts[0];
        last = parts.slice(1, parts.length - 1).join(' ');
        email = parts[parts.length - 1];
      }
    }

    if (email && email.includes('@') && first && last) {
      visitors.push({
        first: first,
        last: last,
        email: email
      });
    }
  });

  return visitors;
}

// Render visitors list
function renderVisitorList(filterText = '') {
  const container = document.getElementById('visitorListContainer');
  const emptyState = document.getElementById('visitorListEmpty');
  
  if (!container) return;

  const filter = filterText.toLowerCase().trim();
  const filtered = state.registeredVisitors.filter(visitor => {
    return (
      visitor.first.toLowerCase().includes(filter) ||
      visitor.last.toLowerCase().includes(filter) ||
      visitor.email.toLowerCase().includes(filter) ||
      visitor.buildingName.toLowerCase().includes(filter)
    );
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    Array.from(container.children).forEach(child => {
      if (child.id !== 'visitorListEmpty') child.remove();
    });
    return;
  }

  emptyState.style.display = 'none';

  Array.from(container.children).forEach(child => {
    if (child.id !== 'visitorListEmpty') child.remove();
  });

  filtered.forEach(visitor => {
    const card = document.createElement('div');
    card.className = 'visitor-card';
    
    // Determine status (Active vs Upcoming)
    const now = new Date();
    let isUpcoming = true;
    try {
      const entryDate = new Date(visitor.entryDateStr);
      if (entryDate <= now) isUpcoming = false;
    } catch(e) {}
    
    const tagClass = isUpcoming ? 'tag-upcoming' : 'tag-active';
    const tagLabel = isUpcoming ? 'Upcoming' : 'Active';

    card.innerHTML = `
      <div class="visitor-info">
        <div class="visitor-name">
          ${visitor.first} ${visitor.last}
          <span class="tag ${tagClass}">${tagLabel}</span>
        </div>
        <div class="visitor-meta">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            ${visitor.email}
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${visitor.buildingName}
          </span>
          <span style="width: 100%; margin-top: 2px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${visitor.entryDateStr} — ${visitor.exitDateStr}
          </span>
        </div>
      </div>
      <div class="visitor-actions">
        <button class="btn btn-secondary btn-icon btn-dup" title="Clone guest details" data-id="${visitor.visitid}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
        ${!isUpcoming ? `
          <button class="btn btn-secondary btn-icon btn-checkout" title="Check out early" data-id="${visitor.visitid}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        ` : ''}
        <button class="btn btn-secondary btn-icon btn-delete" title="Cancel registration" data-id="${visitor.visitid}" style="color: var(--accent-danger); border-color: rgba(239, 68, 68, 0.1);">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    `;

    // Button event bindings
    card.querySelector('.btn-dup').addEventListener('click', () => {
      appendGuestRow(visitor.first, visitor.last, visitor.email || '');

      const matchingB = state.buildings.find((b) => {
        const name = getBuildingName(b);
        return name && (name.includes(visitor.buildingName) || visitor.buildingName.includes(name));
      });
      if (matchingB) {
        document.getElementById('buildingSearch').value = getBuildingName(matchingB);
        document.getElementById('buildingId').value = getBuildingId(matchingB);
      }

      showToast(`Added ${visitor.first} ${visitor.last} to the guest list`, 'success');
    });

    const checkoutBtn = card.querySelector('.btn-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (confirm(`Check out ${visitor.first} ${visitor.last} early?`)) {
          checkoutGuest(visitor.visitid, visitor);
        }
      });
    }

    card.querySelector('.btn-delete').addEventListener('click', () => {
      if (confirm(`Cancel visitor registration for ${visitor.first} ${visitor.last}?`)) {
        deleteGuest(visitor.visitid);
      }
    });

    container.appendChild(card);
  });
}

// Date helpers
function formatApiDate(date) {
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const D = String(date.getDate()).padStart(2, '0');
  const H = String(date.getHours()).padStart(2, '0');
  const Min = String(date.getMinutes()).padStart(2, '0');
  const S = '00';
  return `${Y}${M}${D}${H}${Min}${S}`;
}

function formatDisplayDateTime(apiDateStr) {
  if (apiDateStr.length !== 14) return apiDateStr;
  
  const Y = apiDateStr.substring(0, 4);
  const M = parseInt(apiDateStr.substring(4, 6)) - 1;
  const D = apiDateStr.substring(6, 8);
  const H = parseInt(apiDateStr.substring(8, 10));
  const Min = apiDateStr.substring(10, 12);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const meridian = H >= 12 ? 'PM' : 'AM';
  const hour12 = H % 12 === 0 ? 12 : H % 12;
  
  return `${months[M]} ${D}, ${Y} ${String(hour12).padStart(2, '0')}:${Min} ${meridian}`;
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'error') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  } else {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse';
    setTimeout(() => {
      toast.remove();
    }, 280);
  }, 4000);
}

// Mock Data Generators
function getMockBuildings() {
  return [
    { BUILDING_ID: 'B-60FAV', BUILDING_NAME: '60 Fifth Avenue', ADDRESS_SIMPLE: 'Forbes Building, New York, United States, 10011', ADDRESS_ALT: '60 Fifth Avenue, New York, United States, 10011', PAGEID: '', PERMSPAGEID: 'H118' },
    { BUILDING_ID: 'B-BOBST', BUILDING_NAME: 'Elmer Holmes Bobst Library', ADDRESS_SIMPLE: '70 Washington Square S, New York, United States, 10012', PAGEID: '', PERMSPAGEID: 'H118' },
    { BUILDING_ID: 'B-WWH', BUILDING_NAME: 'Warren Weaver Hall', ADDRESS_SIMPLE: '251 Mercer St, New York, United States, 10012', PAGEID: '', PERMSPAGEID: 'H118' },
    { BUILDING_ID: 'B-TISCH', BUILDING_NAME: 'Tisch Hall', ADDRESS_SIMPLE: '40 West 4th St, New York, United States, 10012', PAGEID: '', PERMSPAGEID: 'H118' },
    { BUILDING_ID: 'B-KIMMEL', BUILDING_NAME: 'Kimmel Center for University Life', ADDRESS_SIMPLE: '60 Washington Square S, New York, United States, 10012', PAGEID: '', PERMSPAGEID: 'H118' },
    { BUILDING_ID: 'B-370JAY', BUILDING_NAME: '370 Jay Street', ADDRESS_SIMPLE: '370 Jay St, Brooklyn, United States, 11201', PAGEID: '', PERMSPAGEID: 'H118' }
  ];
}

function getMockRegisteredVisitors() {
  return [
    {
      visitid: 'mock_1',
      first: 'Yann',
      last: 'LeCun',
      email: 'yann.lecun@nyu.edu',
      buildingName: '60 5th Ave (Center for Data Science)',
      entryDateStr: 'Jun 21, 2026 09:00 AM',
      exitDateStr: 'Jun 21, 2026 05:00 PM',
      status: 'Registered'
    },
    {
      visitid: 'mock_2',
      first: 'Alice',
      last: 'Curry',
      email: 'alice.curry@gmail.com',
      buildingName: 'Elmer Holmes Bobst Library',
      entryDateStr: 'Jun 22, 2026 10:00 AM',
      exitDateStr: 'Jun 22, 2026 04:00 PM',
      status: 'Registered'
    }
  ];
}
