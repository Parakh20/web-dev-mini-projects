import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BMICalculator from './components/BMICalculator';
import BMIResult from './components/BMIResult';
import BMIHistory from './components/BMIHistory';
import BMI_DATA from './constants/bmiData';
import './App.css';

function App() {
  const [unit, setUnit] = useState('metric');
  const [bmiResult, setBmiResult] = useState(null);
  const [bmiHistory, setBmiHistory] = useState(() => {
    const savedHistory = localStorage.getItem('bmiHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('bmiHistory', JSON.stringify(bmiHistory));
  }, [bmiHistory]);

  const calculateBMI = (height, weight) => {
    let bmi;
    
    if (unit === 'metric') {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
    } else {
      bmi = (weight / (height * height)) * 703;
    }
    
    const category = getBMICategory(bmi);
    const markerPosition = calculateMarkerPosition(bmi);
    
    setBmiResult({
      bmi,
      category,
      description: category.description,
      recommendations: category.recommendations,
      markerPosition
    });
    
    addToHistory(bmi, height, weight, category);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return BMI_DATA.categories[0];
    if (bmi < 25) return BMI_DATA.categories[1];
    if (bmi < 30) return BMI_DATA.categories[2];
    return BMI_DATA.categories[3];
  };

  const calculateMarkerPosition = (bmi) => {
    if (bmi <= 18.5) return Math.min((bmi / 18.5) * 23, 23);
    if (bmi <= 25) return 23 + ((bmi - 18.5) / 6.5) * 39;
    if (bmi <= 30) return 62 + ((bmi - 25) / 5) * 13;
    return Math.min(75 + ((bmi - 30) / 20) * 25, 100);
  };

  const addToHistory = (bmi, height, weight, category) => {
    const newHistoryItem = {
      bmi: bmi.toFixed(1),
      height,
      weight,
      unit,
      category: category.category,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const newHistory = [newHistoryItem, ...bmiHistory].slice(0, 10);
    setBmiHistory(newHistory);
  };

  const switchUnits = (newUnit) => {
    setUnit(newUnit);
    setBmiResult(null);
  };

  const clearForm = () => {
    setBmiResult(null);
  };

  const clearHistory = () => {
    setBmiHistory([]);
  };

  return (
    <div className="container">
      <Header />
      
      <main className="main-content">
        <BMICalculator 
          onCalculate={calculateBMI}
          onClear={clearForm}
          unit={unit}
          switchUnits={switchUnits}
        />
        
        {bmiResult && (
          <BMIResult 
            bmi={bmiResult.bmi}
            category={bmiResult.category}
            description={bmiResult.description}
            recommendations={bmiResult.recommendations}
            markerPosition={bmiResult.markerPosition}
          />
        )}
        
        <BMIHistory 
          history={bmiHistory} 
          onClearHistory={clearHistory} 
        />
      </main>
    </div>
  );
}

export default App;