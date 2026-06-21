// ==UserScript==
// @name         NYU Modern Guest Registration
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A modern front-end overlay for the NYU visitor registration portal.
// @author       Kyunghyun Cho
// @updateURL    https://github.com/kyunghyuncho/nyu-guest-registration/raw/main/NYU-Modern-Guest-Registration.user.js
// @downloadURL  https://github.com/kyunghyuncho/nyu-guest-registration/raw/main/NYU-Modern-Guest-Registration.user.js
// @match        https://nyu.identigy.io/patron/VisitorManagement/VisitorsHost.php*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';
  const SCRIPT_VERSION = '1.0';
  console.log(`[NYU-ModernReg] v${SCRIPT_VERSION} loaded`);

  const cssStyles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  
  --bg-app: #09050d;
  --bg-gradient: radial-gradient(circle at 50% -20%, #291147 0%, #09050d 70%);
  --panel-bg: rgba(22, 14, 33, 0.7);
  --panel-border: rgba(171, 112, 255, 0.12);
  --panel-border-hover: rgba(171, 112, 255, 0.25);
  
  --text-primary: #f3eeff;
  --text-secondary: #bbaecf;
  --text-muted: #84769c;
  
  --primary: #8f3bff;
  --primary-hover: #a35eff;
  --primary-glow: rgba(143, 59, 255, 0.4);
  --primary-muted: #4e2294;
  
  --accent-nyu: #57068c;
  --accent-success: #10b981;
  --accent-success-glow: rgba(16, 185, 129, 0.2);
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;
  
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.6);
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --toast-bg: rgba(20, 10, 30, 0.95);
  --toast-text: #f3eeff;
}

body.light-theme {
  --bg-app: #f6f4fa;
  --bg-gradient: radial-gradient(circle at 50% -20%, #e8dbfc 0%, #f6f4fa 70%);
  --panel-bg: rgba(255, 255, 255, 0.8);
  --panel-border: rgba(87, 6, 140, 0.1);
  --panel-border-hover: rgba(87, 6, 140, 0.22);
  
  --text-primary: #1f1235;
  --text-secondary: #5a4b75;
  --text-muted: #8d7eab;
  
  --primary: #57068c;
  --primary-hover: #7209b7;
  --primary-glow: rgba(87, 6, 140, 0.15);
  --primary-muted: #dbccff;
  
  --shadow-sm: 0 2px 8px rgba(87, 6, 140, 0.05);
  --shadow-md: 0 8px 24px rgba(87, 6, 140, 0.08);
  --shadow-lg: 0 16px 48px rgba(87, 6, 140, 0.12);

  --toast-bg: rgba(255, 255, 255, 0.96);
  --toast-text: #1f1235;
}

.modern-ui-container * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

#modern-ui-root {
  background: var(--bg-app);
  background-image: var(--bg-gradient);
  background-attachment: fixed;
  color: var(--text-primary);
  min-height: 100vh;
  padding: 2rem 1.5rem;
  transition: background-color 0.4s ease, color 0.4s ease;
}

.modern-ui-container .modern-container {
  max-width: 1200px !important;
  margin: 0 auto !important;
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
}

.modern-ui-container .modern-panel {
  background: var(--panel-bg) !important;
  border: 1px solid var(--panel-border) !important;
  border-radius: var(--radius-lg) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  padding: 2.5rem !important;
  box-shadow: var(--shadow-lg) !important;
  transition: border-color 0.3s ease, box-shadow 0.3s ease !important;
  margin-bottom: 2rem !important;
}

.modern-ui-container .modern-panel:hover {
  border-color: var(--panel-border-hover) !important;
}

.modern-ui-container .modern-header {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 2.5rem !important;
  border-bottom: 1px solid var(--panel-border) !important;
  padding-bottom: 1.5rem !important;
  width: 100% !important;
}

.modern-ui-container .modern-brand-section {
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
}

.modern-ui-container .modern-logo-icon {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent-nyu) 100%) !important;
  width: 46px !important;
  height: 46px !important;
  border-radius: var(--radius-md) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  font-weight: 700 !important;
  font-size: 1.4rem !important;
  box-shadow: 0 4px 12px var(--primary-glow) !important;
}

.modern-ui-container .modern-brand-title h1 {
  font-size: 1.6rem !important;
  font-weight: 700 !important;
  letter-spacing: -0.5px !important;
  background: linear-gradient(90deg, var(--text-primary) 30%, var(--primary-hover) 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.modern-ui-container .modern-brand-title p {
  font-size: 0.85rem !important;
  color: var(--text-muted) !important;
  font-weight: 400 !important;
}

.modern-ui-container .modern-controls {
  display: flex !important;
  gap: 0.75rem !important;
}

.modern-ui-container .modern-dashboard-grid {
  display: grid !important;
  grid-template-columns: 1.1fr 0.9fr !important;
  gap: 2rem !important;
  width: 100% !important;
}

.modern-ui-container @media (max-width: 900px) {
  .modern-dashboard-grid {
    grid-template-columns: 1fr !important;
  }
}

.modern-ui-container .section-title {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  margin-bottom: 1.5rem !important;
  color: var(--text-primary) !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.modern-ui-container .form-group {
  margin-bottom: 1.25rem;
  position: relative;
  overflow: visible;
}

.modern-ui-container .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modern-ui-container .form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.modern-ui-container input,
.modern-ui-container textarea {
  width: 100% !important;
  height: auto !important;
  line-height: 1.5 !important;
  padding: 0.85rem 1rem !important;
  background: rgba(0, 0, 0, 0.2) !important;
  border: 1px solid var(--panel-border) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-primary) !important;
  font-size: 0.95rem !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  outline: none !important;
  box-sizing: border-box !important;
}

.modern-ui-container select {
  width: 100% !important;
  height: auto !important;
  line-height: 1.5 !important;
  padding: 0.85rem 2.5rem 0.85rem 1rem !important;
  border: 1px solid var(--panel-border) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-primary) !important;
  font-size: 0.95rem !important;
  transition: border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  outline: none !important;
  box-sizing: border-box !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  background-color: rgba(0, 0, 0, 0.2) !important;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23bbaecf' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: right 1rem center !important;
  background-size: 1.1rem !important;
  cursor: pointer !important;
}

body.light-theme input,
body.light-theme textarea {
  background: rgba(255, 255, 255, 0.7) !important;
}

body.light-theme select {
  background-color: rgba(255, 255, 255, 0.85) !important;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235a4b75' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
}

.modern-ui-container input:focus,
.modern-ui-container textarea:focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 3px var(--primary-glow) !important;
  background: rgba(0, 0, 0, 0.3) !important;
}

.modern-ui-container select:focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 3px var(--primary-glow) !important;
  background-color: rgba(0, 0, 0, 0.3) !important;
}

body.light-theme input:focus,
body.light-theme textarea:focus {
  background: rgba(255, 255, 255, 0.9) !important;
}

body.light-theme select:focus {
  background-color: rgba(255, 255, 255, 0.95) !important;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2357048c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
}

.modern-ui-container select option {
  background: var(--bg-app) !important;
  color: var(--text-primary) !important;
}

.modern-ui-container .autocomplete-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-app);
  border: 1px solid var(--panel-border-hover);
  border-radius: var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: var(--shadow-lg);
  margin-top: 4px;
}

.modern-ui-container .suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s ease;
  color: var(--text-primary);
}

.modern-ui-container .suggestion-item:hover {
  background: var(--primary-muted);
  color: #fff;
}

.modern-ui-container .suggestion-item strong {
  color: var(--primary-hover);
}

.modern-ui-container .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
  text-decoration: none;
}

.modern-ui-container .btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent-nyu) 100%);
  color: #fff;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.modern-ui-container .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--primary-glow);
  filter: brightness(1.1);
}

.modern-ui-container .btn-primary:active {
  transform: translateY(0);
}

.modern-ui-container .btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border: 1px solid var(--panel-border);
}

.modern-ui-container .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--panel-border-hover);
}

.modern-ui-container .btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: var(--radius-md);
}

.modern-ui-container .tabs {
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 4px;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
  border: 1px solid var(--panel-border);
}

.modern-ui-container .tab-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: calc(var(--radius-md) - 2px);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.modern-ui-container .tab-btn.active {
  background: var(--panel-bg);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.modern-ui-container .bulk-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modern-ui-container .bulk-help {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
  background: rgba(143, 59, 255, 0.05);
  border-left: 3px solid var(--primary);
  padding: 0.75rem 1rem;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.modern-ui-container .visitor-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 580px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.modern-ui-container .visitor-card {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.25s ease;
}

body.light-theme .visitor-card {
  background: rgba(255, 255, 255, 0.5);
}

.modern-ui-container .visitor-card:hover {
  border-color: var(--panel-border-hover);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.modern-ui-container .visitor-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modern-ui-container .visitor-name {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.modern-ui-container .visitor-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.modern-ui-container .visitor-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.modern-ui-container .tag {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.modern-ui-container .tag-active {
  background: var(--accent-success-glow);
  color: var(--accent-success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.modern-ui-container .tag-upcoming {
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent-warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.modern-ui-container .visitor-actions {
  display: flex;
  gap: 0.5rem;
}

.modern-ui-container .quick-dup-section {
  margin-top: 1.5rem;
  border-top: 1px solid var(--panel-border);
  padding-top: 1.5rem;
}

.modern-ui-container .quick-dup-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.modern-ui-container .quick-dup-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.modern-ui-container .quick-dup-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.modern-ui-container .quick-dup-chip:hover {
  background: var(--primary-muted);
  border-color: var(--primary);
  color: #fff;
}

.modern-ui-container .queue-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modern-ui-container .queue-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--panel-border);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.modern-ui-container .queue-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.modern-ui-container .status-pending { color: var(--text-muted); }

.modern-ui-container .status-sending { color: var(--primary-hover); animation: pulse 1.5s infinite; }

.modern-ui-container .status-success { color: var(--accent-success); }

.modern-ui-container .status-failed { color: var(--accent-danger); }

.modern-ui-container .switch-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.modern-ui-container .switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.modern-ui-container .switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.modern-ui-container .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: .3s;
  border-radius: 24px;
  border: 1px solid var(--panel-border);
}

.modern-ui-container .slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: #fff;
  transition: .3s;
  border-radius: 50%;
}

.modern-ui-container input:checked + .slider {
  background-color: var(--primary);
}

.modern-ui-container input:checked + .slider:before {
  transform: translateX(20px);
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.modern-ui-container ::-webkit-scrollbar {
  width: 6px;
}

.modern-ui-container ::-webkit-scrollbar-track {
  background: transparent;
}

.modern-ui-container ::-webkit-scrollbar-thumb {
  background: var(--panel-border);
  border-radius: 10px;
}

.modern-ui-container ::-webkit-scrollbar-thumb:hover {
  background: var(--panel-border-hover);
}

.modern-ui-container .toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modern-ui-container .toast {
  background: var(--toast-bg);
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  padding: 1rem 1.5rem;
  color: var(--toast-text);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 0.9rem;
  font-weight: 500;
}

.modern-ui-container .toast svg {
  flex-shrink: 0;
  stroke: currentColor;
}

.modern-ui-container .toast.success {
  border-color: var(--accent-success);
  color: var(--toast-text);
}

.modern-ui-container .toast.error {
  border-color: var(--accent-danger);
  color: var(--toast-text);
}

.modern-ui-container .toast.warning {
  border-color: var(--accent-warning);
  color: var(--toast-text);
}

body.light-theme .toast.success svg {
  stroke: var(--accent-success);
}

body.light-theme .toast.error svg {
  stroke: var(--accent-danger);
}

body.light-theme .toast.warning svg,
body.light-theme .toast.info svg {
  stroke: var(--primary);
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modern-ui-container .date-input-wrapper {
  position: relative;
  overflow: visible;
}

.modern-ui-container .date-input-wrapper input {
  cursor: pointer !important;
  padding-right: 2.5rem !important;
}

.modern-ui-container .date-input-wrapper .calendar-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-muted);
  opacity: 0.6;
}

.calendar-popup {
  position: fixed;
  z-index: 10000000;
  background: var(--panel-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 1rem;
  min-width: 290px;
  animation: calFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

@keyframes calFadeIn {
  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.cal-header .cal-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.cal-header button {
  background: none;
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-size: 1rem;
  padding: 0;
}

.cal-header button:hover {
  background: var(--primary-glow);
  border-color: var(--primary);
  color: var(--primary);
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}

.cal-dow {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 0.3rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cal-day {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
  background: none;
  color: var(--text-primary);
  transition: all 0.15s ease;
  margin: 1px auto;
  padding: 0;
}

.cal-day:hover {
  background: var(--primary-glow);
  color: var(--primary);
}

.cal-day.today {
  border: 1px solid var(--primary);
  font-weight: 600;
}

.cal-day.selected {
  background: var(--primary) !important;
  color: #fff !important;
  font-weight: 600;
}

.cal-day.disabled {
  color: var(--text-muted);
  opacity: 0.3;
  cursor: not-allowed;
}

.cal-day.disabled:hover {
  background: none;
  color: var(--text-muted);
}

.cal-day.other-month {
  color: var(--text-muted);
  opacity: 0.4;
}
`;

  const htmlTemplate = `
  <div class="modern-ui-container">
    <div class="modern-container">
    <!-- Header -->
    <header class="modern-header">
      <div class="modern-brand-section">
        <div class="modern-logo-icon">NYU</div>
        <div class="modern-brand-title">
          <h1>Visitor Registration</h1>
          <p>Glen de Vries Portal Wrapper</p>
        </div>
      </div>
      <div class="modern-controls">
        <button id="themeToggle" class="btn btn-secondary btn-icon" title="Toggle Dark/Light Mode">
          <!-- Moon Icon -->
          <svg id="moonIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          <!-- Sun Icon (hidden by default) -->
          <svg id="sunIcon" style="display:none;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        </button>
        <button id="refreshList" class="btn btn-secondary" title="Sync Visitors List">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
          Sync
        </button>
      </div>
    </header>

    <!-- Main Dashboard -->
    <div class="modern-dashboard-grid">
      
      <!-- Left Column: Registration controls -->
      <div>
        <div class="modern-panel">
          <!-- Form Tabs -->
          <div class="tabs">
            <button class="tab-btn active" data-tab="single">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              Single Guest
            </button>
            <button class="tab-btn" data-tab="bulk">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Bulk Upload
            </button>
          </div>

          <!-- Tab 1: Single Guest Registration -->
          <div id="singleTab" class="tab-content">
            <form id="registrationForm" autocomplete="off">
              <div class="form-row">
                <div class="form-group">
                  <label for="first">First Name *</label>
                  <input type="text" id="first" required placeholder="John">
                  <div id="firstSuggestions" class="autocomplete-suggestions" style="display: none;"></div>
                </div>
                <div class="form-group">
                  <label for="last">Last Name *</label>
                  <input type="text" id="last" required placeholder="Doe">
                  <div id="lastSuggestions" class="autocomplete-suggestions" style="display: none;"></div>
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email Address *</label>
                <input type="email" id="email" required placeholder="john.doe@example.com">
                <div id="emailSuggestions" class="autocomplete-suggestions" style="display: none;"></div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="visitorType">Visitor Type</label>
                  <select id="visitorType">
                    <option value="Visitor">Visitor</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="buildingSearch">NYU Building *</label>
                  <input type="text" id="buildingSearch" required placeholder="Search building (e.g. 60 5th...)">
                  <input type="hidden" id="buildingId">
                  <input type="hidden" id="buildingPageId">
                  <div id="buildingSuggestions" class="autocomplete-suggestions" style="display: none;"></div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="startDate">Arrival Date</label>
                  <div class="date-input-wrapper">
                    <input type="text" id="startDate" readonly required placeholder="Select date...">
                    <svg class="calendar-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                </div>
                <div class="form-group">
                  <label for="startTime">Arrival Time</label>
                  <input type="time" id="startTime" value="09:00" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="endDate">Departure Date</label>
                  <div class="date-input-wrapper">
                    <input type="text" id="endDate" readonly required placeholder="Select date...">
                    <svg class="calendar-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                </div>
                <div class="form-group">
                  <label for="endTime">Departure Time</label>
                  <input type="time" id="endTime" value="17:00" required>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Preregister Visitor
              </button>
            </form>

            <!-- Quick Duplicator Chip Dock -->
            <div class="quick-dup-section" id="quickDupSection" style="display: none;">
              <div class="quick-dup-title">Frequently Registered</div>
              <div class="quick-dup-list" id="quickDupList">
                <!-- Chips will be generated here -->
              </div>
            </div>
          </div>

          <!-- Tab 2: Bulk Guest Registration -->
          <div id="bulkTab" class="tab-content" style="display: none;">
            <div class="bulk-container">
              <div class="bulk-help">
                <strong>No CSV files required.</strong> Simply paste visitor rows directly. Supports formats:<br>
                • <code>First Last, email@domain.com</code><br>
                • <code>First, Last, email@domain.com</code><br>
                • <code>First Last &lt;email@domain.com&gt;</code> (e.g. copied from Outlook/Gmail)
              </div>
              
              <div class="form-group">
                <label for="bulkPaste">Visitor Rows</label>
                <textarea id="bulkPaste" rows="6" placeholder="Jane Doe, jane@nyu.edu&#10;Bob Smith, bob@gmail.com"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="bulkBuildingSearch">NYU Building *</label>
                  <input type="text" id="bulkBuildingSearch" placeholder="Search building for all guests...">
                  <input type="hidden" id="bulkBuildingId">
                  <input type="hidden" id="bulkBuildingPageId">
                  <div id="bulkBuildingSuggestions" class="autocomplete-suggestions" style="display: none;"></div>
                </div>
                <div class="form-group">
                  <label for="bulkVisitorType">Visitor Type</label>
                  <select id="bulkVisitorType">
                    <option value="Visitor">Visitor</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="bulkStartDate">Arrival Date</label>
                  <div class="date-input-wrapper">
                    <input type="text" id="bulkStartDate" readonly placeholder="Select date...">
                    <svg class="calendar-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                </div>
                <div class="form-group">
                  <label for="bulkStartTime">Arrival Time</label>
                  <input type="time" id="bulkStartTime" value="09:00">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="bulkEndDate">Departure Date</label>
                  <div class="date-input-wrapper">
                    <input type="text" id="bulkEndDate" readonly placeholder="Select date...">
                    <svg class="calendar-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                </div>
                <div class="form-group">
                  <label for="bulkEndTime">Departure Time</label>
                  <input type="time" id="bulkEndTime" value="17:00">
                </div>
              </div>

              <button id="btnRegisterBulk" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                Register Batch
              </button>

              <!-- Queue list/logs for bulk registration -->
              <div class="queue-list" id="bulkQueue" style="display: none;">
                <!-- Queue entries will appear here -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Expected & Active Visitors -->
      <div>
        <div class="modern-panel" style="height: calc(100% - 2rem); display: flex; flex-direction: column;">
          <div class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Registered Visitors
          </div>
          
          <!-- Search list filter -->
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <input type="text" id="visitorFilter" placeholder="Filter by visitor name, building or email...">
          </div>

          <div class="visitor-list" id="visitorListContainer">
            <!-- Empty state -->
            <div id="visitorListEmpty" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <p>No visitors registered or synched yet.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Toast Container -->

    <div class="toast-container" id="toastContainer"></div>
  </div>
  `;

  function initInjection() {
    console.log('NYU Modern Guest UI Injector starting...');

    const uiRoot = document.createElement('div');
    uiRoot.id = 'modern-ui-root';
    uiRoot.innerHTML = htmlTemplate;

    const styleBlock = document.createElement('style');
    styleBlock.id = 'modern-ui-styles';
    styleBlock.textContent = cssStyles;
    document.head.appendChild(styleBlock);

    const originalBody = document.body;
    const bodyChildren = Array.from(originalBody.children);

    const hiddenWrapper = document.createElement('div');
    hiddenWrapper.id = 'original-identigy-content';
    hiddenWrapper.style.display = 'none';

    bodyChildren.forEach(child => {
      if (child !== styleBlock && child.tagName !== 'SCRIPT') {
        hiddenWrapper.appendChild(child);
      }
    });

    originalBody.appendChild(hiddenWrapper);
    originalBody.appendChild(uiRoot);

    originalBody.style.background = '#09050d';
    originalBody.style.margin = '0';
    originalBody.style.padding = '0';

    bindUILogic();
  }

  function bindUILogic() {
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

    let startCal, endCal, bulkStartCal, bulkEndCal;

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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
        return { setDate: () => {}, setMinDate: () => {}, getDate: () => '' };
      }

      let currentMonth = new Date().getMonth();
      let currentYear = new Date().getFullYear();
      let selectedISO = opts.initial || '';
      let minISO = opts.minDate || '';
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
          if (minD && iso < minD) classes.push('disabled');
          html += `<button type="button" class="cal-day ${classes.join(' ')}" data-iso="${iso}" ${minD && iso < minD ? 'disabled' : ''}>${day}</button>`;
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

      return { setDate, setMinDate, getDate: () => selectedISO, close };
    }

    function initDatePickers() {
      const todayISO = toISO(new Date());

      startCal = createCalendarPicker(document.getElementById('startDate'), { initial: todayISO, minDate: todayISO });
      endCal = createCalendarPicker(document.getElementById('endDate'), { initial: todayISO, minDate: todayISO });
      startCal.setDate(todayISO);
      endCal.setDate(todayISO);

      document.getElementById('startDate').addEventListener('change', () => {
        const newStart = document.getElementById('startDate').dataset.isoValue;
        if (newStart) {
          endCal.setMinDate(newStart);
          endCal.setDate(newStart);
        }
      });

      const bulkStartEl = document.getElementById('bulkStartDate');
      const bulkEndEl = document.getElementById('bulkEndDate');
      if (bulkStartEl && bulkEndEl) {
        bulkStartCal = createCalendarPicker(bulkStartEl, { initial: todayISO, minDate: todayISO });
        bulkEndCal = createCalendarPicker(bulkEndEl, { initial: todayISO, minDate: todayISO });
        bulkStartCal.setDate(todayISO);
        bulkEndCal.setDate(todayISO);

        bulkStartEl.addEventListener('change', () => {
          const newStart = bulkStartEl.dataset.isoValue;
          if (newStart) {
            bulkEndCal.setMinDate(newStart);
            bulkEndCal.setDate(newStart);
          }
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
            const bulkStartVal = getDateInputValue('bulkStartDate');
            if (bulkStartVal && startCal) startCal.setDate(bulkStartVal);
            if (document.getElementById('bulkStartTime').value) {
              document.getElementById('startTime').value = document.getElementById('bulkStartTime').value;
            }
            const bulkEndVal = getDateInputValue('bulkEndDate');
            if (bulkEndVal && endCal) endCal.setDate(bulkEndVal);
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
            const startVal = getDateInputValue('startDate');
            if (startVal && bulkStartCal) bulkStartCal.setDate(startVal);
            if (document.getElementById('startTime').value) {
              document.getElementById('bulkStartTime').value = document.getElementById('startTime').value;
            }
            const endVal = getDateInputValue('endDate');
            if (endVal && bulkEndCal) bulkEndCal.setDate(endVal);
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
          const displayName = b.BUILDING_NAME || b.building_name || b.BuildingName || b.name || input.value;
          input.value = displayName;
          idHolder.value = b.BUILDING_ID || b.building_id || b.BuildingID || b.buildingId || b.id || '';
          pageIdHolder.value = b.PAGEID || b.PERMSPAGEID || b.pageId || b.PageID || b.pageid || '';
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
        pageIdHolder.value = '';

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

          const name = building.BUILDING_NAME || building.building_name || building.BuildingName || building.name || '';
          const bldgId = building.BUILDING_ID || building.building_id || building.BuildingID || building.id || '';
          const pageId = building.PAGEID || building.PERMSPAGEID || building.pageId || building.PageID || building.pageid || '';
          const addr = building.ADDRESS_SIMPLE || building.address || '';
          const escapedVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${escapedVal})`, 'gi');
          const displayText = name || addr || JSON.stringify(building).substring(0, 60);
          const highlighted = displayText.replace(regex, '<strong>$1</strong>');
          const secondaryInfo = name ? (addr ? addr : `ID: ${bldgId}`) : `ID: ${bldgId}`;
          div.innerHTML = `${highlighted} <span style="font-size: 0.75rem; color: var(--text-muted); float: right;">${secondaryInfo}</span>`;

          div.addEventListener('mousedown', (e) => {
            e.preventDefault();
            input.value = name || addr;
            idHolder.value = bldgId;
            pageIdHolder.value = pageId;
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

        const resolvedPageID = window.gPageID || 
                               (document.querySelector('input[name="pageID"]') ? document.querySelector('input[name="pageID"]').value : '') || 
                               '-1';

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
        const searchVal = buildingName.toLowerCase();
        const exactMatch = state.buildings.find(b => {
          const name = (b.BUILDING_NAME || '').toLowerCase();
          const addr = (b.ADDRESS_SIMPLE || '').toLowerCase();
          return name === searchVal || addr === searchVal;
        });
        if (exactMatch) {
          buildingId = exactMatch.BUILDING_ID || '';
          buildingPageId = exactMatch.PAGEID || exactMatch.PERMSPAGEID || '';
          document.getElementById('buildingSearch').value = exactMatch.BUILDING_NAME || '';
          document.getElementById('buildingId').value = buildingId;
          document.getElementById('buildingPageId').value = buildingPageId;
        } else {
          const matches = state.buildings.filter(b => {
            const name = (b.BUILDING_NAME || '').toLowerCase();
            const addr = (b.ADDRESS_SIMPLE || '').toLowerCase();
            return name.includes(searchVal) || addr.includes(searchVal);
          });
          if (matches.length === 1) {
            buildingId = matches[0].BUILDING_ID || '';
            buildingPageId = matches[0].PAGEID || matches[0].PERMSPAGEID || '';
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

      const startDate = getDateInputValue('startDate');
      const startTime = document.getElementById('startTime').value;
      const endDate = getDateInputValue('endDate');
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
        if (state.isMockMode) {
          syncVisitors();
        } else {
          setTimeout(() => window.location.reload(), 1000);
        }
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
        if (state.buildings.length === 0) {
          if (window.gBuildingData && window.gBuildingData.length > 0) {
            state.buildings = window.gBuildingData;
          } else {
            await fetchBuildings();
          }
        }

        const searchVal = buildingName.toLowerCase();
        const allStringValsMatch = (b, sv, exact) => {
          for (const key of Object.keys(b)) {
            const v = b[key];
            if (typeof v === 'string') {
              if (exact ? v.toLowerCase() === sv : v.toLowerCase().includes(sv)) return true;
            }
          }
          return false;
        };

        const resolveBldg = (b) => {
          buildingId = b.BUILDING_ID || b.building_id || b.BuildingID || b.buildingId || b.id || '';
          buildingPageId = b.PAGEID || b.PERMSPAGEID || b.pageId || b.PageID || b.pageid || '';
          const displayName = b.BUILDING_NAME || b.building_name || b.BuildingName || b.name || buildingName;
          document.getElementById('bulkBuildingSearch').value = displayName;
          document.getElementById('bulkBuildingId').value = buildingId;
          document.getElementById('bulkBuildingPageId').value = buildingPageId;
        };

        const exact = state.buildings.find(b => allStringValsMatch(b, searchVal, true));
        if (exact) {
          resolveBldg(exact);
        } else {
          const partials = state.buildings.filter(b => allStringValsMatch(b, searchVal, false));
          if (partials.length === 1) {
            resolveBldg(partials[0]);
          } else if (partials.length > 1) {
            const startsWith = partials.filter(b => {
              for (const key of Object.keys(b)) {
                const v = b[key];
                if (typeof v === 'string' && v.toLowerCase().startsWith(searchVal)) return true;
              }
              return false;
            });
            resolveBldg(startsWith.length === 1 ? startsWith[0] : partials[0]);
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

      const startDate = getDateInputValue('bulkStartDate');
      const startTime = document.getElementById('bulkStartTime').value;
      const endDate = getDateInputValue('bulkEndDate');
      const endTime = document.getElementById('bulkEndTime').value;

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
      if (state.isMockMode) {
        syncVisitors();
      } else {
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
          document.getElementById('first').value = visitor.first;
          document.getElementById('last').value = visitor.last;
          document.getElementById('email').value = visitor.email;
          
          const matchingB = state.buildings.find(b => b.BUILDING_NAME.includes(visitor.buildingName) || visitor.buildingName.includes(b.BUILDING_NAME));
          if (matchingB) {
            document.getElementById('buildingSearch').value = matchingB.BUILDING_NAME;
            document.getElementById('buildingId').value = matchingB.BUILDING_ID;
            document.getElementById('buildingPageId').value = matchingB.PAGEID || matchingB.PERMSPAGEID || '';
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

        // Bootstrap (live portal)
        state.isMockMode = false;
        if (!state.sesstok) state.sesstok = window.__sesstok || '';
        if (!state.pid) state.pid = window.__pid || '';
        if (!state.uhash) state.uhash = window.__uhash || '';

        initTheme();
        initDatePickers();
        loadLocalStorageData();
        setupEventListeners();

        fetchBuildings().then(() => syncVisitors());
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initInjection();
  } else {
    window.addEventListener('DOMContentLoaded', initInjection);
  }
})();
