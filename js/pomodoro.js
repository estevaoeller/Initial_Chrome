// js/pomodoro.js

import { verifyTogglToken, getTogglProjects, startTogglTimer, stopTogglTimer } from './toggl.js';
import { defaultSettings } from './config.js';

let timerInterval = null;
let currentSettings = null;
let togglWorkspaceId = null;

// DOM Elements
const pomodoroWidget = document.getElementById('pomodoro-widget');
const timeDisplay = document.getElementById('pomodoro-time');
const modeBadge = document.getElementById('pomodoro-mode-badge');
const descInput = document.getElementById('pomodoro-desc');
const projectSelect = document.getElementById('pomodoro-project');
const playBtn = document.getElementById('pomodoro-play-btn');
const stopBtn = document.getElementById('pomodoro-stop-btn');

export async function initPomodoro() {
    if (!pomodoroWidget) return;

    // Load settings
    const result = await new Promise(resolve => chrome.storage.sync.get(['extensionSettings'], resolve));
    currentSettings = Object.assign({}, defaultSettings, result.extensionSettings || {});

    const toggleBtn = document.getElementById('toggl-toggle-btn');
    
    // Check if module is enabled
    if (currentSettings.pomodoroEnabled === false) {
        pomodoroWidget.style.display = 'none';
        if (toggleBtn) toggleBtn.style.display = 'none';
        return;
    }

    // Handle toggle button
    if (toggleBtn) {
        toggleBtn.style.display = 'flex';
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            pomodoroWidget.style.display = pomodoroWidget.style.display === 'none' ? 'flex' : 'none';
        });
    }

    // Setup Toggl if token exists
    if (currentSettings.togglApiToken) {
        setupToggl(currentSettings.togglApiToken);
    }

    // Load saved state
    const localState = await new Promise(resolve => chrome.storage.local.get([
        'pomodoroActive', 'pomodoroEndTime', 'pomodoroMode', 'pomodoroTogglEntryId'
    ], resolve));

    if (localState.pomodoroActive && localState.pomodoroEndTime) {
        pomodoroWidget.style.display = 'flex';
        restoreTimer(localState.pomodoroEndTime, localState.pomodoroMode, localState.pomodoroTogglEntryId);
    } else {
        resetTimerUI(localState.pomodoroMode || 'work');
    }

    // Event Listeners
    playBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    
    // Auto-save description
    descInput.addEventListener('change', () => {
        chrome.storage.local.set({ pomodoroDesc: descInput.value });
    });
    
    // Restore description
    chrome.storage.local.get(['pomodoroDesc'], (res) => {
        if (res.pomodoroDesc) descInput.value = res.pomodoroDesc;
    });
}

async function setupToggl(token) {
    const authRes = await verifyTogglToken(token);
    if (authRes.success) {
        togglWorkspaceId = authRes.workspaceId;
        const projRes = await getTogglProjects(token, togglWorkspaceId);
        if (projRes.success && projRes.projects.length > 0) {
            populateProjects(projRes.projects);
        }
    } else {
        console.warn('Toggl verification failed:', authRes.error);
    }
}

function populateProjects(projects) {
    projectSelect.innerHTML = '<option value="none">Sem Projeto</option>';
    projects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        // Optionally flavor with color: opt.style.color = p.color;
        projectSelect.appendChild(opt);
    });
    projectSelect.style.display = 'block';

    // Restore selected project
    chrome.storage.local.get(['pomodoroProjectId'], (res) => {
        if (res.pomodoroProjectId) {
            projectSelect.value = res.pomodoroProjectId;
        }
    });

    projectSelect.addEventListener('change', () => {
        chrome.storage.local.set({ pomodoroProjectId: projectSelect.value });
    });
}

async function startTimer() {
    // Determine duration
    const localState = await new Promise(resolve => chrome.storage.local.get(['pomodoroMode'], resolve));
    const mode = localState.pomodoroMode || 'work';
    
    const minutes = mode === 'work' ? (currentSettings.pomodoroWork || 25) : (currentSettings.pomodoroBreak || 5);
    const endTime = Date.now() + minutes * 60 * 1000;

    let entryId = null;

    // Start Toggl if in work mode and configured
    if (mode === 'work' && togglWorkspaceId && currentSettings.togglApiToken) {
        const desc = descInput.value || 'Pomodoro Timer Focus';
        const projId = projectSelect.value;
        const res = await startTogglTimer(currentSettings.togglApiToken, togglWorkspaceId, desc, projId);
        if (res.success) {
            entryId = res.timeEntryId;
        }
    }

    // Save state
    await new Promise(resolve => chrome.storage.local.set({
        pomodoroActive: true,
        pomodoroEndTime: endTime,
        pomodoroMode: mode,
        pomodoroTogglEntryId: entryId
    }, resolve));

    // Create Alarm for background notification
    chrome.alarms.create('pomodoroAlarm', { when: endTime });

    // Update UI
    restoreTimer(endTime, mode, entryId);
}

async function stopTimer() {
    // Clear alarm
    chrome.alarms.clear('pomodoroAlarm');

    // Stop Toggl if active
    const localState = await new Promise(resolve => chrome.storage.local.get(['pomodoroTogglEntryId', 'pomodoroMode'], resolve));
    if (localState.pomodoroTogglEntryId && currentSettings.togglApiToken && togglWorkspaceId) {
        await stopTogglTimer(currentSettings.togglApiToken, togglWorkspaceId, localState.pomodoroTogglEntryId);
    }

    // Advance Mode (work -> break, break -> work)
    const nextMode = (localState.pomodoroMode || 'work') === 'work' ? 'break' : 'work';

    await new Promise(resolve => chrome.storage.local.set({
        pomodoroActive: false,
        pomodoroEndTime: null,
        pomodoroTogglEntryId: null,
        pomodoroMode: nextMode
    }, resolve));

    resetTimerUI(nextMode);
}

function restoreTimer(endTime, mode, entryId) {
    if (timerInterval) clearInterval(timerInterval);

    playBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    descInput.disabled = true;
    projectSelect.disabled = true;

    modeBadge.textContent = mode === 'work' ? 'Trabalho' : 'Pausa';
    modeBadge.className = `badge ${mode}`;

    updateTimeDisplay(endTime);

    timerInterval = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(timerInterval);
            onTimerComplete(mode, entryId);
        } else {
            updateTimeDisplay(endTime);
        }
    }, 1000);
}

async function onTimerComplete(mode, entryId) {
    // Timer naturally finished
    if (entryId && currentSettings.togglApiToken && togglWorkspaceId) {
        await stopTogglTimer(currentSettings.togglApiToken, togglWorkspaceId, entryId);
    }

    const nextMode = mode === 'work' ? 'break' : 'work';
    
    await new Promise(resolve => chrome.storage.local.set({
        pomodoroActive: false,
        pomodoroEndTime: null,
        pomodoroTogglEntryId: null,
        pomodoroMode: nextMode
    }, resolve));

    resetTimerUI(nextMode);
}

function resetTimerUI(mode) {
    if (timerInterval) clearInterval(timerInterval);
    
    playBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    descInput.disabled = false;
    projectSelect.disabled = false;

    modeBadge.textContent = mode === 'work' ? 'Trabalho' : 'Pausa';
    modeBadge.className = `badge ${mode}`;

    const minutes = mode === 'work' ? (currentSettings.pomodoroWork || 25) : (currentSettings.pomodoroBreak || 5);
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:00`;
}

function updateTimeDisplay(endTime) {
    const remaining = Math.max(0, endTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    timeDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
