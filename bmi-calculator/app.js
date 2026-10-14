// BMI Calculator Application - Week 2 Assignment
// Demonstrates: Functions, Event Listeners, DOM Manipulation, Conditional Logic

// BMI Categories and validation data
const BMI_DATA = {
  categories: [
    {
      category: "Underweight",
      range: "< 18.5",
      color: "#3498db",
      description: "A BMI below 18.5 indicates that you may be underweight. Consider consulting with a healthcare provider about healthy weight gain strategies.",
      recommendations: ["Increase caloric intake with nutrient-dense foods", "Consider strength training exercises", "Consult with a healthcare professional"]
    },
    {
      category: "Normal weight", 
      range: "18.5 - 24.9",
      color: "#27ae60",
      description: "A BMI between 18.5 and 24.9 indicates that you are at a healthy weight for your height. Maintain your current lifestyle.",
      recommendations: ["Continue balanced diet and regular exercise", "Maintain current healthy habits", "Regular health check-ups"]
    },
    {
      category: "Overweight",
      range: "25.0 - 29.9", 
      color: "#f39c12",
      description: "A BMI between 25 and 29.9 indicates that you may be overweight. Consider adopting healthier eating habits and increasing physical activity.",
      recommendations: ["Focus on portion control", "Increase physical activity", "Choose nutrient-dense, lower-calorie foods"]
    },
    {
      category: "Obese",
      range: "≥ 30.0",
      color: "#e74c3c", 
      description: "A BMI of 30 or higher indicates obesity. Consider consulting with a healthcare provider about weight management strategies.",
      recommendations: ["Consult with healthcare professional", "Consider structured weight loss program", "Focus on sustainable lifestyle changes"]
    }
  ],
  validation: {
    height_metric: {min: 50, max: 300, unit: "cm"},
    weight_metric: {min: 10, max: 500, unit: "kg"},
    height_imperial: {min: 20, max: 120, unit: "inches"}, 
    weight_imperial: {min: 22, max: 1100, unit: "lbs"}
  }
};

// Application state
let currentUnit = 'metric';
let bmiHistory = [];

// DOM Elements
const elements = {
  form: document.getElementById('bmi-form'),
  heightInput: document.getElementById('height'),
  weightInput: document.getElementById('weight'),
  heightUnit: document.getElementById('height-unit'),
  weightUnit: document.getElementById('weight-unit'),
  heightError: document.getElementById('height-error'),
  weightError: document.getElementById('weight-error'),
  metricBtn: document.getElementById('metric-btn'),
  imperialBtn: document.getElementById('imperial-btn'),
  calculateBtn: document.getElementById('calculate-btn'),
  clearBtn: document.getElementById('clear-btn'),
  resultsCard: document.getElementById('results-card'),
  bmiValue: document.getElementById('bmi-value'),
  bmiCategory: document.getElementById('bmi-category'),
  bmiMarker: document.getElementById('bmi-marker'),
  bmiDescription: document.getElementById('bmi-description'),
  recommendationsList: document.getElementById('recommendations-list'),
  historyCard: document.getElementById('history-card'),
  historyList: document.getElementById('history-list'),
  clearHistoryBtn: document.getElementById('clear-history-btn')
};

// Core Functions

/**
 * Calculate BMI based on height and weight
 * @param {number} height - Height value
 * @param {number} weight - Weight value
 * @param {string} unit - Unit system ('metric' or 'imperial')
 * @returns {number} BMI value
 */
function calculateBMI(height, weight, unit) {
  if (unit === 'metric') {
    // BMI = weight (kg) / (height (m))²
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  } else {
    // BMI = (weight (lbs) / (height (inches))²) × 703
    return (weight / (height * height)) * 703;
  }
}

/**
 * Get BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {object} BMI category object
 */
function getBMICategory(bmi) {
  if (bmi < 18.5) {
    return BMI_DATA.categories[0]; // Underweight
  } else if (bmi < 25) {
    return BMI_DATA.categories[1]; // Normal weight
  } else if (bmi < 30) {
    return BMI_DATA.categories[2]; // Overweight
  } else {
    return BMI_DATA.categories[3]; // Obese
  }
}

/**
 * Validate input values
 * @param {number} height - Height value
 * @param {number} weight - Weight value
 * @param {string} unit - Unit system
 * @returns {object} Validation result
 */
function validateInputs(height, weight, unit) {
  const validation = BMI_DATA.validation;
  const heightKey = `height_${unit}`;
  const weightKey = `weight_${unit}`;
  
  const errors = {};
  
  // Height validation
  if (!height || isNaN(height)) {
    errors.height = 'Please enter a valid height';
  } else if (height < validation[heightKey].min || height > validation[heightKey].max) {
    errors.height = `Height must be between ${validation[heightKey].min} and ${validation[heightKey].max} ${validation[heightKey].unit}`;
  }
  
  // Weight validation
  if (!weight || isNaN(weight)) {
    errors.weight = 'Please enter a valid weight';
  } else if (weight < validation[weightKey].min || weight > validation[weightKey].max) {
    errors.weight = `Weight must be between ${validation[weightKey].min} and ${validation[weightKey].max} ${validation[weightKey].unit}`;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Update input validation UI
 * @param {string} field - Input field name
 * @param {string} error - Error message
 */
function updateValidationUI(field, error) {
  const input = elements[`${field}Input`];
  const errorElement = elements[`${field}Error`];
  
  if (error) {
    input.classList.add('error');
    input.classList.remove('success');
    errorElement.textContent = error;
  } else {
    input.classList.remove('error');
    input.classList.add('success');
    errorElement.textContent = '';
  }
}

/**
 * Calculate BMI marker position for visual indicator
 * @param {number} bmi - BMI value
 * @returns {number} Position percentage
 */
function calculateMarkerPosition(bmi) {
  // Range positions: 0-18.5 (23%), 18.5-25 (39%), 25-30 (13%), 30+ (25%)
  if (bmi <= 18.5) {
    return Math.min((bmi / 18.5) * 23, 23);
  } else if (bmi <= 25) {
    return 23 + ((bmi - 18.5) / 6.5) * 39;
  } else if (bmi <= 30) {
    return 62 + ((bmi - 25) / 5) * 13;
  } else {
    return Math.min(75 + ((bmi - 30) / 20) * 25, 100);
  }
}

/**
 * Update BMI results display
 * @param {number} bmi - BMI value
 * @param {number} height - Height value
 * @param {number} weight - Weight value
 */
function updateResults(bmi, height, weight) {
  const category = getBMICategory(bmi);
  
  // Update BMI value and category
  elements.bmiValue.textContent = bmi.toFixed(1);
  elements.bmiCategory.textContent = category.category;
  elements.bmiCategory.style.color = category.color;
  
  // Update description
  elements.bmiDescription.textContent = category.description;
  
  // Update recommendations
  elements.recommendationsList.innerHTML = '';
  category.recommendations.forEach(rec => {
    const li = document.createElement('li');
    li.textContent = rec;
    elements.recommendationsList.appendChild(li);
  });
  
  // Update BMI marker position
  const position = calculateMarkerPosition(bmi);
  elements.bmiMarker.style.left = `${position}%`;
  
  // Show results card with animation
  elements.resultsCard.style.display = 'block';
  elements.resultsCard.classList.add('show');
  
  // Add to history
  addToHistory(bmi, height, weight, category);
}

/**
 * Add BMI calculation to history
 * @param {number} bmi - BMI value
 * @param {number} height - Height value
 * @param {number} weight - Weight value
 * @param {object} category - BMI category
 */
function addToHistory(bmi, height, weight, category) {
  const historyItem = {
    bmi: bmi.toFixed(1),
    height,
    weight,
    unit: currentUnit,
    category: category.category,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  };
  
  bmiHistory.unshift(historyItem);
  
  // Keep only last 10 entries
  if (bmiHistory.length > 10) {
    bmiHistory = bmiHistory.slice(0, 10);
  }
  
  updateHistoryDisplay();
}

/**
 * Update history display
 */
function updateHistoryDisplay() {
  if (bmiHistory.length === 0) {
    elements.historyCard.style.display = 'none';
    return;
  }
  
  elements.historyList.innerHTML = '';
  
  bmiHistory.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const categoryClass = item.category.toLowerCase().replace(' ', '-');
    
    historyItem.innerHTML = `
      <div class="history-item-info">
        <div class="history-bmi">BMI: ${item.bmi}</div>
        <div class="history-details">
          ${item.height}${item.unit === 'metric' ? 'cm' : 'in'}, 
          ${item.weight}${item.unit === 'metric' ? 'kg' : 'lbs'} - 
          ${item.date} ${item.time}
        </div>
      </div>
      <div class="history-category category-${categoryClass}">${item.category}</div>
    `;
    
    elements.historyList.appendChild(historyItem);
  });
  
  elements.historyCard.style.display = 'block';
}

/**
 * Switch between metric and imperial units
 * @param {string} unit - Unit system ('metric' or 'imperial')
 */
function switchUnits(unit) {
  currentUnit = unit;
  
  // Update button states
  elements.metricBtn.classList.toggle('active', unit === 'metric');
  elements.imperialBtn.classList.toggle('active', unit === 'imperial');
  
  // Update unit labels and input attributes
  if (unit === 'metric') {
    elements.heightUnit.textContent = 'cm';
    elements.weightUnit.textContent = 'kg';
    elements.heightInput.placeholder = '170';
    elements.weightInput.placeholder = '70';
    elements.heightInput.min = '50';
    elements.heightInput.max = '300';
    elements.weightInput.min = '10';
    elements.weightInput.max = '500';
  } else {
    elements.heightUnit.textContent = 'in';
    elements.weightUnit.textContent = 'lbs';
    elements.heightInput.placeholder = '70';
    elements.weightInput.placeholder = '154';
    elements.heightInput.min = '20';
    elements.heightInput.max = '120';
    elements.weightInput.min = '22';
    elements.weightInput.max = '1100';
  }
  
  // Clear previous inputs and errors
  elements.heightInput.value = '';
  elements.weightInput.value = '';
  updateValidationUI('height', '');
  updateValidationUI('weight', '');
}

/**
 * Clear form and results
 */
function clearForm() {
  elements.form.reset();
  elements.resultsCard.style.display = 'none';
  updateValidationUI('height', '');
  updateValidationUI('weight', '');
}

/**
 * Clear BMI history
 */
function clearHistory() {
  bmiHistory = [];
  updateHistoryDisplay();
}

/**
 * Real-time input validation
 */
function validateInputsRealTime() {
  const height = parseFloat(elements.heightInput.value);
  const weight = parseFloat(elements.weightInput.value);
  
  if (elements.heightInput.value) {
    const heightValidation = validateInputs(height, weight, currentUnit);
    updateValidationUI('height', heightValidation.errors.height || '');
  }
  
  if (elements.weightInput.value) {
    const weightValidation = validateInputs(height, weight, currentUnit);
    updateValidationUI('weight', weightValidation.errors.weight || '');
  }
}

// Event Listeners

// Form submission
elements.form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const height = parseFloat(elements.heightInput.value);
  const weight = parseFloat(elements.weightInput.value);
  
  const validation = validateInputs(height, weight, currentUnit);
  
  // Update validation UI
  updateValidationUI('height', validation.errors.height || '');
  updateValidationUI('weight', validation.errors.weight || '');
  
  if (validation.valid) {
    const bmi = calculateBMI(height, weight, currentUnit);
    updateResults(bmi, height, weight);
  }
});

// Unit toggle buttons
elements.metricBtn.addEventListener('click', () => switchUnits('metric'));
elements.imperialBtn.addEventListener('click', () => switchUnits('imperial'));

// Clear form button
elements.clearBtn.addEventListener('click', clearForm);

// Clear history button
elements.clearHistoryBtn.addEventListener('click', clearHistory);

// Real-time input validation
elements.heightInput.addEventListener('input', validateInputsRealTime);
elements.weightInput.addEventListener('input', validateInputsRealTime);

// Real-time BMI calculation (optional feature)
elements.heightInput.addEventListener('input', function() {
  const height = parseFloat(elements.heightInput.value);
  const weight = parseFloat(elements.weightInput.value);
  
  if (height && weight) {
    const validation = validateInputs(height, weight, currentUnit);
    if (validation.valid) {
      const bmi = calculateBMI(height, weight, currentUnit);
      updateResults(bmi, height, weight);
    }
  }
});

elements.weightInput.addEventListener('input', function() {
  const height = parseFloat(elements.heightInput.value);
  const weight = parseFloat(elements.weightInput.value);
  
  if (height && weight) {
    const validation = validateInputs(height, weight, currentUnit);
    if (validation.valid) {
      const bmi = calculateBMI(height, weight, currentUnit);
      updateResults(bmi, height, weight);
    }
  }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
    elements.calculateBtn.click();
  }
});

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  // Set initial unit system
  switchUnits('metric');
  
  // Focus on first input
  elements.heightInput.focus();
  
  console.log('BMI Calculator initialized successfully!');
});