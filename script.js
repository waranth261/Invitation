// ==========================================
// STATE VARIABLES
// ==========================================
let chosenTimeMode = ''; // 'before-noon', 'afternoon', 'dinner-only'
let selectedLunch = '';
let selectedSnack = '';
let selectedDinner = '';
let selectedActivities = new Set();

// Custom Input Modes ('replace' or 'add') for Meal Steps
let customModes = {
  lunch: 'replace',
  snack: 'replace',
  dinner: 'replace'
};

// Set minimum datetime input to current time
const datetimeInput = document.getElementById('datetime');
if (datetimeInput) {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  datetimeInput.min = now.toISOString().slice(0, 16);
}

// ==========================================
// PLAYFUL "NO" BUTTON DODGING LOGIC
// ==========================================
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
let yesScale = 1;

if (noBtn) {
  noBtn.addEventListener('mouseover', moveNoButton);
  noBtn.addEventListener('click', moveNoButton);
}

function moveNoButton() {
  const container = document.querySelector('.container');
  const rect = container.getBoundingClientRect();

  const randomX = (Math.random() - 0.5) * (rect.width - 100);
  const randomY = (Math.random() - 0.5) * (rect.height - 100);

  noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
  yesScale += 0.1;
  if (yesBtn) {
    yesBtn.style.transform = `scale(${yesScale})`;
  }
}

// ==========================================
// STEP & BACKGROUND NAVIGATION
// ==========================================
function updateBackground(stepBgIndex) {
  document.body.classList.remove('bg-step-1', 'bg-step-2', 'bg-step-3', 'bg-step-4');
  document.body.classList.add(`bg-step-${stepBgIndex}`);
}

function showStep(stepId, bgIndex) {
  document.querySelectorAll('.step').forEach((step) => {
    step.classList.remove('active');
  });
  const targetStep = document.getElementById(stepId);
  if (targetStep) {
    targetStep.classList.add('active');
  }
  updateBackground(bgIndex);
}

function nextStep(stepNumber) {
  if (stepNumber === 1) showStep('step1', 1);
  if (stepNumber === 2) showStep('step2', 2);
}

// Check time chosen on calendar
function processDateTime() {
  const val = datetimeInput.value;
  if (!val) {
    alert('Please pick a date and time!');
    return;
  }

  const selectedDate = new Date(val);
  const hours = selectedDate.getHours();

  if (hours < 12) {
    // Before 12 PM -> Lunch
    chosenTimeMode = 'before-noon';
    showStep('stepLunch', 3);
  } else if (hours >= 13 && hours < 17) {
    // 1 PM to 4:59 PM -> Snacks then Dinner
    chosenTimeMode = 'afternoon';
    showStep('stepSnacks', 3);
  } else {
    // 12 PM - 1 PM or 5 PM onwards -> Dinner directly
    chosenTimeMode = 'dinner-only';
    showStep('stepDinner', 3);
  }
}

// ==========================================
// ACCORDION & CHOICE SELECTION
// ==========================================
function toggleSubMenu(cardElement) {
  const parentContainer = cardElement.parentElement;
  parentContainer.querySelectorAll('.category-card').forEach((card) => {
    if (card !== cardElement) card.classList.remove('active');
  });
  cardElement.classList.toggle('active');
}

function selectSubOption(event, mealType, categoryName, subValue) {
  event.stopPropagation(); // Prevents closing the accordion card

  const cardElement = event.target.closest('.category-card');
  const grid = cardElement.querySelector('.sub-options-grid');
  
  grid.querySelectorAll('.sub-chip').forEach(chip => chip.classList.remove('selected'));
  event.target.classList.add('selected');

  const badge = cardElement.querySelector('.selected-badge');
  if (badge) {
    badge.innerText = `Selected: ${subValue}`;
  }

  const fullChoice = `${categoryName} (${subValue})`;
  if (mealType === 'lunch') selectedLunch = fullChoice;
  if (mealType === 'snack') selectedSnack = fullChoice;
  if (mealType === 'dinner') selectedDinner = fullChoice;
}

function toggleActivitySubOption(event, chipElement, activityValue) {
  event.stopPropagation();
  chipElement.classList.toggle('selected');

  if (selectedActivities.has(activityValue)) {
    selectedActivities.delete(activityValue);
  } else {
    selectedActivities.add(activityValue);
  }

  const cardElement = chipElement.closest('.category-card');
  const badge = cardElement.querySelector('.selected-badge');
  const selectedCount = cardElement.querySelectorAll('.sub-chip.selected').length;

  if (badge) {
    badge.innerText = selectedCount > 0 ? `${selectedCount} spot(s) chosen` : 'Tap to pick spot';
  }
}

// ==========================================
// ADD (+) / REPLACE (⇄) TOGGLE LOGIC
// ==========================================
function toggleCustomMode(mealType) {
  const currentMode = customModes[mealType];
  const newMode = currentMode === 'replace' ? 'add' : 'replace';
  customModes[mealType] = newMode;

  const btn = document.getElementById(`${mealType}ModeBtn`);
  const icon = document.getElementById(`${mealType}ModeIcon`);
  const text = document.getElementById(`${mealType}ModeText`);
  const hint = document.getElementById(`${mealType}ModeHint`);

  if (newMode === 'add') {
    if (btn) btn.className = 'mode-btn add-mode';
    if (icon) icon.innerText = '+';
    if (text) text.innerText = 'Add';
    if (hint) hint.innerText = '💡 Current Mode: Adds to your selected choice above.';
  } else {
    if (btn) btn.className = 'mode-btn replace-mode';
    if (icon) icon.innerText = '⇄';
    if (text) text.innerText = 'Replace';
    if (hint) hint.innerText = '💡 Current Mode: Replaces selected choice if filled out.';
  }
}

// ==========================================
// STEP CONFIRMATION HANDLERS
// ==========================================
function confirmLunch() {
  const custom = document.getElementById('customLunch') ? document.getElementById('customLunch').value.trim() : '';
  const mode = customModes['lunch'];

  if (custom) {
    if (mode === 'add' && selectedLunch) {
      selectedLunch = `${selectedLunch} + ${custom}`;
    } else {
      selectedLunch = custom;
    }
  }

  if (!selectedLunch) {
    alert('Please pick a lunch spot or type your own!');
    return;
  }
  showStep('stepActivities', 3);
}

function confirmSnacks() {
  const custom = document.getElementById('customSnack') ? document.getElementById('customSnack').value.trim() : '';
  const mode = customModes['snack'];

  if (custom) {
    if (mode === 'add' && selectedSnack) {
      selectedSnack = `${selectedSnack} + ${custom}`;
    } else {
      selectedSnack = custom;
    }
  }

  if (!selectedSnack) {
    alert('Please pick a snack spot or type your own!');
    return;
  }
  showStep('stepDinner', 3);
}

function confirmDinner() {
  const custom = document.getElementById('customDinner') ? document.getElementById('customDinner').value.trim() : '';
  const mode = customModes['dinner'];

  if (custom) {
    if (mode === 'add' && selectedDinner) {
      selectedDinner = `${selectedDinner} + ${custom}`;
    } else {
      selectedDinner = custom;
    }
  }

  if (!selectedDinner) {
    alert('Please pick a dinner spot or type your own!');
    return;
  }
  showStep('stepActivities', 3);
}

// ==========================================
// DYNAMIC BACK BUTTON ROUTING
// ==========================================
function goBackFromDinner() {
  if (chosenTimeMode === 'afternoon') {
    showStep('stepSnacks', 3);
  } else {
    showStep('step2', 2);
  }
}

function goBackFromActivities() {
  if (chosenTimeMode === 'before-noon') {
    showStep('stepLunch', 3);
  } else {
    showStep('stepDinner', 3);
  }
}

// ==========================================
// SUMMARY TABLE GENERATION & CONFETTI
// ==========================================
function finishDatePlan() {
  const customActInput = document.getElementById('customActivity');
  const customAct = customActInput ? customActInput.value.trim() : '';
  let activitiesList = Array.from(selectedActivities);

  if (customAct) activitiesList.push(customAct);

  if (activitiesList.length === 0) {
    alert('Please choose at least one activity!');
    return;
  }

  const rawDate = new Date(datetimeInput.value);
  const formattedDate = rawDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tableBody = document.getElementById('summaryTableBody');
  let tableHTML = `
    <tr>
      <th>Date & Time</th>
      <td>${formattedDate}</td>
    </tr>
  `;

  if (selectedLunch) {
    tableHTML += `<tr><th>Lunch</th><td>${selectedLunch}</td></tr>`;
  }

  if (selectedSnack) {
    tableHTML += `<tr><th>Snack</th><td>${selectedSnack}</td></tr>`;
  }

  if (selectedDinner) {
    tableHTML += `<tr><th>Dinner</th><td>${selectedDinner}</td></tr>`;
  }

  tableHTML += `
    <tr>
      <th>Activities</th>
      <td>${activitiesList.join(', ')}</td>
    </tr>
  `;

  if (tableBody) {
    tableBody.innerHTML = tableHTML;
  }
  
  showStep('stepSummary', 4);
  launchConfetti();
}

function launchConfetti() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.6 } });
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.6 } });
  }
}

// Initialize on Step 1
updateBackground(1);