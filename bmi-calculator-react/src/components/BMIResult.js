import React from 'react';
import BMI_DATA from '../constants/bmiData';

const BMIResult = ({ bmi, category, description, recommendations, markerPosition }) => {
  if (!bmi) return null;

  return (
    <div className="results-section">
      <div className="card show">
        <div className="card__body">
          <h2>Your BMI Result</h2>
          <div className="bmi-display">
            <div className="bmi-value">{bmi.toFixed(1)}</div>
            <div className="bmi-category" style={{ color: category.color }}>
              {category.category}
            </div>
          </div>
          
          <div className="bmi-range-indicator">
            <div className="range-bar">
              <div 
                className="range-marker" 
                style={{ left: `${markerPosition}%` }} 
              />
              <div className="range-labels">
                <span className="range-label">18.5</span>
                <span className="range-label">25</span>
                <span className="range-label">30</span>
              </div>
            </div>
          </div>

          <div className="bmi-description">
            {description}
          </div>

          <div className="recommendations">
            <h3>Health Recommendations</h3>
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMIResult;