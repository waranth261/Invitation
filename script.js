// State management variables
let selectedLunch = '';
let selectedSnack = '';
let selectedDinner = '';
let selectedActivities = new Set();

// Tracks whether lunch was skipped based on selected time
let isLunchSkipped = false;

// Custom input mode tracking ('replace' or 'add')
let customModes = {
  lunch: 'replace',
  snack: 'replace',
  dinner: 'replace'
};

// Mode toggle helper function
function toggleCustomMode(mealType) {
  const modeBtn = document.getElementById(`${mealType}ModeBtn`);
  const modeIcon = document.getElementById(`${mealType}ModeIcon`);
  const modeText = document.getElementById(`${mealType}ModeText`);
  const modeHint = document.getElementById(`${mealType}ModeHint`);

  if (customModes[mealType] === 'replace') {
    customModes[mealType] = 'add';
    modeBtn.classList.remove('replace-mode');
    modeBtn.classList.add('add-mode');
    modeIcon.textContent = '+';
    modeText.textContent = 'Add';
    modeHint.textContent = '💡 Current Mode: Appends custom choice to selected category.';
  } else {
    customModes[mealType] = 'replace';
    modeBtn.classList.remove('add-mode');
    modeBtn.classList.add('replace-mode');
    modeIcon.textContent = '⇄';
    modeText.textContent = 'Replace';
    modeHint.textContent = '💡 Current Mode: Replaces selected choice if filled out.';
  }
}

// Navigation helper + Step Background Switcher
function showStep(stepId, stepNum) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(stepId).classList.add('active');

  // Change body background image based on step number
  document.body.className = `bg-step-${stepNum}`;
}

function nextStep(stepNumber) {
  if (stepNumber === 1) showStep('step1', 1);
  if (stepNumber === 2) showStep('step2', 2);
}

// Process Name, Date & Time Selection with Time Routing Logic
function processDateTime() {
  const nameInput = document.getElementById('userName');
  const datetimeInput = document.getElementById('datetime');

  // Validate Name Input
  if (!nameInput.value.trim()) {
    alert('Please enter your name!');
    nameInput.focus();
    return;
  }

  // Validate Date & Time Input
  if (!datetimeInput.value) {
    alert('Please pick a date and time!');
    return;
  }

  const selectedDate = new Date(datetimeInput.value);
  const hour = selectedDate.getHours(); // 0 - 23 format

  // Time-based routing logic:
  if (hour < 13) {
    // Before 1:00 PM -> Show Lunch
    isLunchSkipped = false;
    showStep('stepLunch', 3);
  } else if (hour >= 13 && hour <= 17) {
    // 1:00 PM to 5:00 PM -> Skip Lunch, go directly to Snacks
    isLunchSkipped = true;
    selectedLunch = ''; 
    showStep('stepSnacks', 3);
  } else {
    // After 5:00 PM -> Skip Lunch and Snacks, go directly to Dinner
    isLunchSkipped = true;
    selectedLunch = '';
    selectedSnack = '';
    showStep('stepDinner', 3);
  }
}

// Submenu Accordion Toggle (Uses .active class)
function toggleSubMenu(cardElement) {
  const parentStack = cardElement.parentElement;
  const isAlreadyActive = cardElement.classList.contains('active');

  // Close other open cards in the same section
  parentStack.querySelectorAll('.category-card').forEach(card => {
    card.classList.remove('active');
  });

  if (!isAlreadyActive) {
    cardElement.classList.add('active');
  }
}

// Sub-option selection logic for Lunch, Snacks, and Dinner
function selectSubOption(event, type, categoryName, choiceValue) {
  event.stopPropagation(); // Prevent card accordion from toggling off

  const parentCard = event.currentTarget.closest('.category-card');
  const parentStack = parentCard.parentElement;

  // Clear previous chip highlights
  parentStack.querySelectorAll('.sub-chip').forEach(chip => chip.classList.remove('selected'));
  event.currentTarget.classList.add('selected');

  // Update badge on card header
  parentCard.querySelector('.selected-badge').textContent = `Selected: ${choiceValue}`;

  if (type === 'lunch') selectedLunch = choiceValue;
  if (type === 'snack') selectedSnack = choiceValue;
  if (type === 'dinner') selectedDinner = choiceValue;
}

// Activity sub-option toggling (Multiple selection allowed)
function toggleActivitySubOption(event, buttonElement, choiceValue) {
  event.stopPropagation();

  if (selectedActivities.has(choiceValue)) {
    selectedActivities.delete(choiceValue);
    buttonElement.classList.remove('selected');
  } else {
    selectedActivities.add(choiceValue);
    buttonElement.classList.add('selected');
  }
}

// Confirmation Step Navigation Handlers
function confirmLunch() {
  const customInput = document.getElementById('customLunch').value.trim();
  if (customInput) {
    if (customModes.lunch === 'add' && selectedLunch) {
      selectedLunch = `${selectedLunch} + ${customInput}`;
    } else {
      selectedLunch = customInput;
    }
  }
  showStep('stepSnacks', 3);
}

function confirmSnacks() {
  const customInput = document.getElementById('customSnack').value.trim();
  if (customInput) {
    if (customModes.snack === 'add' && selectedSnack) {
      selectedSnack = `${selectedSnack} + ${customInput}`;
    } else {
      selectedSnack = customInput;
    }
  }
  showStep('stepDinner', 3);
}

function confirmDinner() {
  const customInput = document.getElementById('customDinner').value.trim();
  if (customInput) {
    if (customModes.dinner === 'add' && selectedDinner) {
      selectedDinner = `${selectedDinner} + ${customInput}`;
    } else {
      selectedDinner = customInput;
    }
  }
  showStep('stepActivities', 3);
}

// Dynamic Back Navigation Logic
function goBackFromSnacks() {
  if (isLunchSkipped) {
    showStep('step2', 2); // Return to Date & Time selection if lunch was skipped
  } else {
    showStep('stepLunch', 3); // Return to Lunch
  }
}

function goBackFromDinner() { 
  const datetimeInput = document.getElementById('datetime');
  if (datetimeInput.value) {
    const hour = new Date(datetimeInput.value).getHours();
    if (hour > 17) {
      showStep('step2', 2); // Go directly to Date & Time if both lunch & snacks were skipped
      return;
    }
  }
  showStep('stepSnacks', 3); 
}

function goBackFromActivities() { 
  showStep('stepDinner', 3); 
}

// Final Submission with Formspree Data Post
function finishDatePlan() {
  const customActInput = document.getElementById('customActivity');
  const customAct = customActInput ? customActInput.value.trim() : '';
  let activitiesList = Array.from(selectedActivities);

  if (customAct) activitiesList.push(customAct);

  if (activitiesList.length === 0) {
    alert('Please choose at least one activity!');
    return;
  }

  const userName = document.getElementById('userName').value.trim();
  const datetimeInput = document.getElementById('datetime');
  const rawDate = new Date(datetimeInput.value);
  const formattedDate = rawDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. Build the summary table for screen display
  const tableBody = document.getElementById('summaryTableBody');
  let tableHTML = `
    <tr>
      <th>Name</th>
      <td>${userName}</td>
    </tr>
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

  // 2. Prepare payload object for Formspree (Includes 'name' field)
  const formData = {
    name: userName,
    dateTime: formattedDate,
    lunch: selectedLunch || 'N/A (Skipped)',
    snack: selectedSnack || 'N/A (Skipped)',
    dinner: selectedDinner || 'N/A',
    activities: activitiesList.join(', ')
  };

  // 3. Send payload to Formspree
  fetch('https://formspree.io/f/xpqvvrlg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (response.ok) {
      showStep('stepSummary', 4);
      launchConfetti();
    } else {
      alert('Oops! Something went wrong saving your choices. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error submitting form:', error);
    alert('Network error. Please check your internet connection.');
  });
}

// Confetti Effect Generator
function launchConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}
