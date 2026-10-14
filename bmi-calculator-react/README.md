# BMI Calculator React App

A React-based Body Mass Index calculator with the following features:

## Features

- **Unit Conversion**: Switch between metric (cm, kg) and imperial (inches, lbs) units
- **Real-time Validation**: Input validation with helpful error messages
- **BMI Calculation**: Accurate BMI calculation with category classification
- **Visual Indicator**: Color-coded BMI range bar with marker
- **Health Recommendations**: Personalized health advice based on BMI category
- **History Tracking**: Local storage of calculation history (up to 10 entries)
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode Support**: Automatic dark/light theme detection

## Setup Instructions

### 1. Create a new Vite React project

```bash
npm create vite@latest week3-bmi-calculator -- --template react
cd week3-bmi-calculator
npm install
```

### 2. Project Structure

```
week3-bmi-calculator/
├── src/
│   ├── components/
│   │   ├── BMICalculator.jsx
│   │   └── BMICalculator.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── README.md
```

### 3. Install and Run

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Select Units**: Choose between Metric (cm, kg) or Imperial (inches, lbs)
2. **Enter Values**: Input your height and weight
3. **Calculate**: Click "Calculate BMI" to get your result
4. **View Results**: See your BMI value, category, and personalized recommendations
5. **History**: View your calculation history in the bottom section
6. **Clear**: Use "Clear" to reset the form or "Clear History" to remove saved calculations

## BMI Categories

- **Underweight**: BMI < 18.5
- **Normal weight**: BMI 18.5 - 24.9
- **Overweight**: BMI 25.0 - 29.9
- **Obese**: BMI ≥ 30.0

## Technical Implementation

### React Hooks Used

- **useState**: For managing component state (form inputs, results, errors)
- **useEffect**: For localStorage operations and side effects

### Key Features

- **Form Validation**: Real-time input validation with error messages
- **State Management**: Centralized state using React hooks
- **Local Storage**: Persistent storage of calculation history
- **Responsive Design**: CSS Grid and Flexbox for layout
- **Accessibility**: Proper ARIA labels and keyboard navigation

### File Organization

Each component has its own CSS file following the pattern:
- `ComponentName.jsx` - React component
- `ComponentName.css` - Component-specific styles

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

To extend this application, you can:

1. Add more health metrics (body fat percentage, muscle mass)
2. Include charts for tracking BMI over time
3. Add user profiles and authentication
4. Integrate with fitness APIs
5. Add export functionality for health data

Vercel Link- https://bmi-calci-react.vercel.app/
