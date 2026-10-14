import React, { useState, useEffect } from 'react';
import BMI_DATA from '../constants/bmiData';

const BMICalculator = ({ onCalculate, onClear, unit, switchUnits }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState({ height: '', weight: '' });

  useEffect(() => {
    validateInputs();
  }, [height, weight, unit]);

  const validateInputs = () => {
    const newErrors = { height: '', weight: '' };
    const validation = BMI_DATA.validation;
    const heightKey = `height_${unit}`;
    const weightKey = `weight_${unit}`;
    
    // Height validation
    if (height && !isNaN(height)) {
      if (height < validation[heightKey].min || height > validation[heightKey].max) {
        newErrors.height = `Height must be between ${validation[heightKey].min} and ${validation[heightKey].max} ${validation[heightKey].unit}`;
      }
    }
    
    // Weight validation
    if (weight && !isNaN(weight)) {
      if (weight < validation[weightKey].min || weight > validation[weightKey].max) {
        newErrors.weight = `Weight must be between ${validation[weightKey].min} and ${validation[weightKey].max} ${validation[weightKey].unit}`;
      }
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!height || !weight || errors.height || errors.weight) {
      return;
    }
    
    onCalculate(parseFloat(height), parseFloat(weight));
  };

  const handleClear = () => {
    setHeight('');
    setWeight('');
    setErrors({ height: '', weight: '' });
    onClear();
  };

  return (
    <div className="calculator-section">
      <div className="card">
        <div className="card__body">
          <form onSubmit={handleSubmit} className="bmi-form">
            <div className="unit-toggle">
              <span className="unit-label">Units:</span>
              <div className="toggle-group">
                <button 
                  type="button" 
                  className={`btn btn--sm toggle-btn ${unit === 'metric' ? 'active' : ''}`}
                  onClick={() => switchUnits('metric')}
                >
                  Metric
                </button>
                <button 
                  type="button" 
                  className={`btn btn--sm toggle-btn ${unit === 'imperial' ? 'active' : ''}`}
                  onClick={() => switchUnits('imperial')}
                >
                  Imperial
                </button>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="height" className="form-label">Height</label>
                <div className="input-group">
                  <input 
                    type="number" 
                    id="height" 
                    className={`form-control ${errors.height ? 'error' : height ? 'success' : ''}`}
                    placeholder={unit === 'metric' ? '170' : '70'}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                  <span className="input-unit">
                    {unit === 'metric' ? 'cm' : 'in'}
                  </span>
                </div>
                <div className="error-message">{errors.height}</div>
              </div>

              <div className="form-group">
                <label htmlFor="weight" className="form-label">Weight</label>
                <div className="input-group">
                  <input 
                    type="number" 
                    id="weight" 
                    className={`form-control ${errors.weight ? 'error' : weight ? 'success' : ''}`}
                    placeholder={unit === 'metric' ? '70' : '154'}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <span className="input-unit">
                    {unit === 'metric' ? 'kg' : 'lbs'}
                  </span>
                </div>
                <div className="error-message">{errors.weight}</div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn--primary btn--full-width"
                disabled={!height || !weight || errors.height || errors.weight}
              >
                Calculate BMI
              </button>
              <button 
                type="button" 
                className="btn btn--secondary btn--full-width"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;