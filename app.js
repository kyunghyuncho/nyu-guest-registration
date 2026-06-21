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
  uhash: ''
};

// Check if we are running in the live NYU environment or locally
function checkEnvironment() {
  const isLive = window.location.hostname.includes('identigy.io');
  state.isMockMode = !isLive;
  
  if (isLive) {
    // Read global variables injected in the page <head>
    state.sesstok = window.__sesstok || '';
    state.pid = window.__pid || '';
    state.uhash = window.__uhash || '';
  } else {
    // Generate dummy tokens for local mockup
    state.sesstok = 'mock_sesstok_123456';
    state.pid = '51031';
    state.uhash = 'mock_uhash_abcdef';
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  checkEnvironment();
  initTheme();
  initDatePickers();
  loadLocalStorageData();
  setupEventListeners();
  
  // Initial Sync
  syncVisitors();
  fetchBuildings();
});

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

// Date and Time Initialization
function initDatePickers() {
  const today = new Date().toISOString().split('T')[0];
  
  // Set default dates for single registration
  document.getElementById('startDate').value = today;
  document.getElementById('endDate').value = today;
  document.getElementById('startDate').min = today;
  document.getElementById('endDate').min = today;
  
  // Set default dates for bulk registration
  const bulkStart = document.getElementById('bulkStartDate');
  const bulkEnd = document.getElementById('bulkEndDate');
  if (bulkStart && bulkEnd) {
    bulkStart.value = today;
    bulkEnd.value = today;
    bulkStart.min = today;
    bulkEnd.min = today;
  }
  
  // Match end date to start date when start date changes
  document.getElementById('startDate').addEventListener('change', (e) => {
    document.getElementById('endDate').value = e.target.value;
    document.getElementById('endDate').min = e.target.value;
  });
  if (bulkStart && bulkEnd) {
    bulkStart.addEventListener('change', (e) => {
      bulkEnd.value = e.target.value;
      bulkEnd.min = e.target.value;
    });
  }
}

// Local Storage & History Caching
function loadLocalStorageData() {
  // Load guest history
  const savedHistory = localStorage.getItem('nyu-visitor-history');
  state.history = savedHistory ? JSON.parse(savedHistory) : [];
  renderQuickDupChips();
  
  // Load mock registrations if in mock mode
  if (state.isMockMode) {
    const savedRegs = localStorage.getItem('nyu-mock-registrations');
    state.registeredVisitors = savedRegs ? JSON.parse(savedRegs) : getMockRegisteredVisitors();
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

function populateFormWithGuest(guest) {
  document.getElementById('first').value = guest.first;
  document.getElementById('last').value = guest.last;
  document.getElementById('email').value = guest.email;
  showToast(`Loaded ${guest.first} ${guest.last}'s details`, 'success');
}

// Event Listeners Setup
function setupEventListeners() {
  // Theme Toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Sync button
  document.getElementById('refreshList').addEventListener('click', () => {
    syncVisitors(true);
  });

  // Tab switching
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabName = tab.getAttribute('data-tab');
      if (tabName === 'single') {
        // copy bulk to single
        if (document.getElementById('bulkBuildingSearch').value) {
          document.getElementById('buildingSearch').value = document.getElementById('bulkBuildingSearch').value;
          document.getElementById('buildingId').value = document.getElementById('bulkBuildingId').value;
          document.getElementById('buildingPageId').value = document.getElementById('bulkBuildingPageId').value;
        }
        if (document.getElementById('bulkStartDate').value) {
          document.getElementById('startDate').value = document.getElementById('bulkStartDate').value;
        }
        if (document.getElementById('bulkStartTime').value) {
          document.getElementById('startTime').value = document.getElementById('bulkStartTime').value;
        }
        if (document.getElementById('bulkEndDate').value) {
          document.getElementById('endDate').value = document.getElementById('bulkEndDate').value;
        }
        if (document.getElementById('bulkEndTime').value) {
          document.getElementById('endTime').value = document.getElementById('bulkEndTime').value;
        }
        if (document.getElementById('bulkVisitorType').value) {
          document.getElementById('visitorType').value = document.getElementById('bulkVisitorType').value;
        }

        document.getElementById('singleTab').style.display = 'block';
        document.getElementById('bulkTab').style.display = 'none';
      } else {
        // copy single to bulk
        if (document.getElementById('buildingSearch').value) {
          document.getElementById('bulkBuildingSearch').value = document.getElementById('buildingSearch').value;
          document.getElementById('bulkBuildingId').value = document.getElementById('buildingId').value;
          document.getElementById('bulkBuildingPageId').value = document.getElementById('buildingPageId').value;
        }
        if (document.getElementById('startDate').value) {
          document.getElementById('bulkStartDate').value = document.getElementById('startDate').value;
        }
        if (document.getElementById('startTime').value) {
          document.getElementById('bulkStartTime').value = document.getElementById('startTime').value;
        }
        if (document.getElementById('endDate').value) {
          document.getElementById('bulkEndDate').value = document.getElementById('endDate').value;
        }
        if (document.getElementById('endTime').value) {
          document.getElementById('bulkEndTime').value = document.getElementById('endTime').value;
        }
        if (document.getElementById('visitorType').value) {
          document.getElementById('bulkVisitorType').value = document.getElementById('visitorType').value;
        }

        document.getElementById('singleTab').style.display = 'none';
        document.getElementById('bulkTab').style.display = 'block';
      }
    });
  });

  // Form Autocomplete for First/Last/Email
  setupInputAutocomplete('first', 'firstSuggestions', 'first');
  setupInputAutocomplete('last', 'lastSuggestions', 'last');
  setupInputAutocomplete('email', 'emailSuggestions', 'email');

  // Building Search Autocomplete
  setupBuildingAutocomplete('buildingSearch', 'buildingId', 'buildingPageId', 'buildingSuggestions');
  setupBuildingAutocomplete('bulkBuildingSearch', 'bulkBuildingId', 'bulkBuildingPageId', 'bulkBuildingSuggestions');

  // Single Form Submit
  document.getElementById('registrationForm').addEventListener('submit', handleSingleSubmit);

  // Bulk Submit
  document.getElementById('btnRegisterBulk').addEventListener('click', handleBulkSubmit);

  // Visitor List Filter
  document.getElementById('visitorFilter').addEventListener('input', (e) => {
    renderVisitorList(e.target.value);
  });
}

// Generic Text Field Autocomplete suggestions
function setupInputAutocomplete(inputId, suggestionsId, fieldKey) {
  const input = document.getElementById(inputId);
  const suggestionsBox = document.getElementById(suggestionsId);
  
  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    if (val.length < 1) {
      suggestionsBox.style.display = 'none';
      return;
    }
    
    // Filter history for matches
    const matches = state.history.filter(guest => 
      guest[fieldKey].toLowerCase().includes(val)
    );
    
    if (matches.length === 0) {
      suggestionsBox.style.display = 'none';
      return;
    }
    
    suggestionsBox.innerHTML = '';
    suggestionsBox.style.display = 'block';
    
    // Deduplicate suggestions
    const uniqueVals = [...new Set(matches.map(m => m[fieldKey]))].slice(0, 5);
    
    uniqueVals.forEach(matchVal => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      
      // Highlight matching characters
      const regex = new RegExp(`(${val})`, 'gi');
      const highlighted = matchVal.replace(regex, '<strong>$1</strong>');
      div.innerHTML = highlighted;
      
      div.addEventListener('click', () => {
        input.value = matchVal;
        suggestionsBox.style.display = 'none';
        
        // If selecting email, auto-fill first and last too
        if (fieldKey === 'email') {
          const guestObj = matches.find(m => m.email === matchVal);
          if (guestObj) {
            document.getElementById('first').value = guestObj.first;
            document.getElementById('last').value = guestObj.last;
            
            // Auto-fill building if present in history record
            if (guestObj.buildingName) {
              const bInput = document.getElementById('buildingSearch');
              const bId = document.getElementById('buildingId');
              const bPageId = document.getElementById('buildingPageId');
              if (bInput && bId && bPageId) {
                bInput.value = guestObj.buildingName;
                bId.value = guestObj.buildingId;
                bPageId.value = guestObj.buildingPageId;
              }
            }
          }
        }
      });
      suggestionsBox.appendChild(div);
    });
  });

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target !== input && e.target !== suggestionsBox) {
      suggestionsBox.style.display = 'none';
    }
  });
}

// Building Autocomplete Setup
function setupBuildingAutocomplete(inputId, idHolderId, pageIdHolderId, suggestionsId) {
  const input = document.getElementById(inputId);
  const idHolder = document.getElementById(idHolderId);
  const pageIdHolder = document.getElementById(pageIdHolderId);
  const suggestionsBox = document.getElementById(suggestionsId);

  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    if (val.length < 2) {
      suggestionsBox.style.display = 'none';
      return;
    }

    // Trigger refetch or window resolve if empty
    if (state.buildings.length === 0) {
      if (window.gBuildingData && window.gBuildingData.length > 0) {
        state.buildings = window.gBuildingData;
      } else {
        fetchBuildings();
      }
    }

    const matches = state.buildings.filter(b => {
      const name = b.BUILDING_NAME || '';
      const addr = b.ADDRESS_SIMPLE || '';
      return name.toLowerCase().includes(val) || addr.toLowerCase().includes(val);
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
      
      const name = building.BUILDING_NAME || '';
      const regex = new RegExp(`(${val})`, 'gi');
      const highlighted = name.replace(regex, '<strong>$1</strong>');
      div.innerHTML = `${highlighted} <span style="font-size: 0.75rem; color: var(--text-muted); float: right;">ID: ${building.BUILDING_ID || ''}</span>`;
      
      div.addEventListener('click', () => {
        input.value = name;
        idHolder.value = building.BUILDING_ID || '';
        pageIdHolder.value = building.PAGEID || '';
        suggestionsBox.style.display = 'none';
      });
      suggestionsBox.appendChild(div);
    });
  });

  document.addEventListener('click', (e) => {
    if (e.target !== input && e.target !== suggestionsBox) {
      suggestionsBox.style.display = 'none';
    }
  });
}

// API: Fetch Buildings
async function fetchBuildings() {
  // Try to resolve from window.gBuildingData first
  if (window.gBuildingData && window.gBuildingData.length > 0) {
    state.buildings = window.gBuildingData;
    console.log('Resolved buildings from window.gBuildingData:', state.buildings.length);
    return;
  }

  if (state.isMockMode) {
    state.buildings = getMockBuildings();
    return;
  }

  try {
    // Sync tokens if they are empty in state
    if (!state.sesstok) state.sesstok = window.__sesstok || '';
    if (!state.pid) state.pid = window.__pid || '';

    const payload = {
      __sesstok: state.sesstok,
      action: 'getBuildingList',
      pid: state.pid,
      iug: window.__iug || '0',
      pageID: '-1'
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
      state.buildings = await response.json();
      console.log('Successfully fetched buildings:', state.buildings.length);
    } else {
      console.error('Failed to fetch buildings:', response.status);
      state.buildings = getMockBuildings(); // fallback to let autocomplete work
    }
  } catch (err) {
    console.error('Error fetching buildings:', err);
    state.buildings = getMockBuildings(); // fallback
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
    // If in Live mode, parse the DOM layout of the host page
    const visitors = [];
    
    // Identigy pages list active/expected guests inside table rows or custom cards
    const rows = document.querySelectorAll('.visitorRow, tr[id^="visitor_"], .card:not(.edit):not(.loading)');
    
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
    const params = new URLSearchParams();
    for (const key in guestData) {
      if (Array.isArray(guestData[key])) {
        guestData[key].forEach(val => params.append(key, val));
      } else {
        params.append(key, guestData[key]);
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

    if (response.ok) {
      const resultText = await response.text();
      let resultJson = {};
      try {
        resultJson = JSON.parse(resultText);
      } catch(e) {
        if (resultText.includes('success') || resultText.includes('location.href')) {
          return { success: true };
        }
      }
      
      if (resultJson.error || resultJson.success === false) {
        return { success: false, error: resultJson.error || 'Server rejected registration' };
      }
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status} Error` };
    }
  } catch (err) {
    console.error('Registration failed:', err);
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

// Form Handlers: Single Guest Submission
async function handleSingleSubmit(e) {
  e.preventDefault();
  
  const first = document.getElementById('first').value.trim();
  const last = document.getElementById('last').value.trim();
  const email = document.getElementById('email').value.trim();
  const visitorType = document.getElementById('visitorType').value;
  const buildingName = document.getElementById('buildingSearch').value.trim();
  let buildingId = document.getElementById('buildingId').value;
  let buildingPageId = document.getElementById('buildingPageId').value;
  
  if (!buildingId || !buildingPageId) {
    const match = state.buildings.find(b => (b.BUILDING_NAME || '').toLowerCase() === buildingName.toLowerCase());
    if (match) {
      buildingId = match.BUILDING_ID || '';
      buildingPageId = match.PAGEID || '';
      document.getElementById('buildingId').value = buildingId;
      document.getElementById('buildingPageId').value = buildingPageId;
    } else {
      const matches = state.buildings.filter(b => (b.BUILDING_NAME || '').toLowerCase().includes(buildingName.toLowerCase()));
      if (matches.length === 1) {
        buildingId = matches[0].BUILDING_ID || '';
        buildingPageId = matches[0].PAGEID || '';
        document.getElementById('buildingSearch').value = matches[0].BUILDING_NAME || '';
        document.getElementById('buildingId').value = buildingId;
        document.getElementById('buildingPageId').value = buildingPageId;
      }
    }
  }

  if (!buildingId || !buildingPageId) {
    showToast('Please select a valid NYU building from the suggestions', 'error');
    return;
  }

  const startDate = document.getElementById('startDate').value;
  const startTime = document.getElementById('startTime').value;
  const endDate = document.getElementById('endDate').value;
  const endTime = document.getElementById('endTime').value;

  const entryDateRaw = new Date(`${startDate}T${startTime}`);
  const exitDateRaw = new Date(`${endDate}T${endTime}`);
  
  if (exitDateRaw <= entryDateRaw) {
    showToast('Departure time must be after arrival time', 'error');
    return;
  }

  const tzOffsetHours = String(new Date().getTimezoneOffset() / 60);

  const payload = {
    action: 'Register',
    __sesstok: state.sesstok,
    first: first,
    last: last,
    local_VisitorType: visitorType,
    local_cdEmail: email,
    'pageID[]': buildingPageId,
    buildingID1: buildingId,
    buildingName1: buildingName,
    client_tz: tzOffsetHours,
    entryDate: formatApiDate(entryDateRaw),
    exitDate: formatApiDate(exitDateRaw),
    approvedIds: '[]'
  };

  showToast('Submitting guest registration...', 'info');

  const res = await registerGuest(payload);
  
  if (res.success) {
    showToast(`Registered ${first} ${last} successfully!`, 'success');
    saveGuestToHistory(first, last, email, buildingName, buildingId, buildingPageId);
    
    // Clear form except building & date preferences
    document.getElementById('first').value = '';
    document.getElementById('last').value = '';
    document.getElementById('email').value = '';
    
    // Refresh list
    syncVisitors();
  } else {
    showToast(`Failed: ${res.error || 'Unknown Error'}`, 'error');
  }
}

// Form Handlers: Bulk Guest Registration
async function handleBulkSubmit() {
  const pasteData = document.getElementById('bulkPaste').value.trim();
  const visitorType = document.getElementById('bulkVisitorType').value;
  const buildingName = document.getElementById('bulkBuildingSearch').value.trim();
  let buildingId = document.getElementById('bulkBuildingId').value;
  let buildingPageId = document.getElementById('bulkBuildingPageId').value;
  
  if (!buildingId || !buildingPageId) {
    const match = state.buildings.find(b => (b.BUILDING_NAME || '').toLowerCase() === buildingName.toLowerCase());
    if (match) {
      buildingId = match.BUILDING_ID || '';
      buildingPageId = match.PAGEID || '';
      document.getElementById('bulkBuildingId').value = buildingId;
      document.getElementById('bulkBuildingPageId').value = buildingPageId;
    } else {
      const matches = state.buildings.filter(b => (b.BUILDING_NAME || '').toLowerCase().includes(buildingName.toLowerCase()));
      if (matches.length === 1) {
        buildingId = matches[0].BUILDING_ID || '';
        buildingPageId = matches[0].PAGEID || '';
        document.getElementById('bulkBuildingSearch').value = matches[0].BUILDING_NAME || '';
        document.getElementById('bulkBuildingId').value = buildingId;
        document.getElementById('bulkBuildingPageId').value = buildingPageId;
      }
    }
  }

  if (!pasteData) {
    showToast('Please paste visitor details', 'error');
    return;
  }

  if (!buildingId || !buildingPageId) {
    showToast('Please select an NYU building from the suggestions', 'error');
    return;
  }

  const entryDateRaw = new Date(`${startDate}T${startTime}`);
  const exitDateRaw = new Date(`${endDate}T${endTime}`);
  
  if (exitDateRaw <= entryDateRaw) {
    showToast('Departure time must be after arrival time', 'error');
    return;
  }

  const guests = parseBulkText(pasteData);
  if (guests.length === 0) {
    showToast('Could not parse any guest rows. Verify format.', 'error');
    return;
  }

  const queueContainer = document.getElementById('bulkQueue');
  queueContainer.innerHTML = '';
  queueContainer.style.display = 'block';

  // Create queue elements
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

  showToast(`Beginning registration of ${guests.length} visitors...`, 'info');
  const tzOffsetHours = String(new Date().getTimezoneOffset() / 60);

  // Register guests sequentially
  for (let i = 0; i < queueItems.length; i++) {
    const item = queueItems[i];
    const statusSpan = document.getElementById(item.statusSpanId);
    
    statusSpan.className = 'queue-status status-sending';
    statusSpan.innerHTML = 'Sending...';

    const payload = {
      action: 'Register',
      __sesstok: state.sesstok,
      first: item.first,
      last: item.last,
      local_VisitorType: visitorType,
      local_cdEmail: item.email,
      'pageID[]': buildingPageId,
      buildingID1: buildingId,
      buildingName1: buildingName,
      client_tz: tzOffsetHours,
      entryDate: formatApiDate(entryDateRaw),
      exitDate: formatApiDate(exitDateRaw),
      approvedIds: '[]'
    };

    const res = await registerGuest(payload);

    if (res.success) {
      statusSpan.className = 'queue-status status-success';
      statusSpan.innerHTML = '✓ Success';
      saveGuestToHistory(item.first, item.last, item.email, buildingName, buildingId, buildingPageId);
    } else {
      statusSpan.className = 'queue-status status-failed';
      statusSpan.innerHTML = `✗ Failed: ${res.error || 'Server error'}`;
    }
    
    // Pause briefly between calls
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  showToast('Bulk registration process finished', 'success');
  document.getElementById('bulkPaste').value = '';
  syncVisitors();
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
      document.getElementById('first').value = visitor.first;
      document.getElementById('last').value = visitor.last;
      document.getElementById('email').value = visitor.email;
      
      const matchingB = state.buildings.find(b => b.BUILDING_NAME.includes(visitor.buildingName) || visitor.buildingName.includes(b.BUILDING_NAME));
      if (matchingB) {
        document.getElementById('buildingSearch').value = matchingB.BUILDING_NAME;
        document.getElementById('buildingId').value = matchingB.BUILDING_ID;
        document.getElementById('buildingPageId').value = matchingB.PAGEID;
      }
      
      document.querySelector('.tab-btn[data-tab="single"]').click();
      showToast(`Cloned details for ${visitor.first} ${visitor.last}`, 'success');
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
    { BUILDING_ID: '28', BUILDING_NAME: '60 5th Ave (Center for Data Science)', ADDRESS_SIMPLE: '60 5th Ave', PAGEID: 'Jcc7bRea8eN4861Y' },
    { BUILDING_ID: '102', BUILDING_NAME: 'Elmer Holmes Bobst Library', ADDRESS_SIMPLE: '70 Washington Square S', PAGEID: 'A182bRea8eN4861Y' },
    { BUILDING_ID: '45', BUILDING_NAME: 'Warren Weaver Hall (Courant Institute)', ADDRESS_SIMPLE: '251 Mercer St', PAGEID: 'Wcc7bRea8eN4861Y' },
    { BUILDING_ID: '15', BUILDING_NAME: 'Tisch Hall (Stern School of Business)', ADDRESS_SIMPLE: '40 West 4th St', PAGEID: 'Tcc7bRea8eN4861Y' },
    { BUILDING_ID: '88', BUILDING_NAME: 'Kimmel Center for University Life', ADDRESS_SIMPLE: '60 Washington Square S', PAGEID: 'Kcc7bRea8eN4861Y' },
    { BUILDING_ID: '201', BUILDING_NAME: '370 Jay Street (NYU Tandon)', ADDRESS_SIMPLE: '370 Jay St', PAGEID: 'J201bRea8eN4861Y' }
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
