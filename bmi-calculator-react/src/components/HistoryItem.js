import React from 'react';

const HistoryItem = ({ item }) => {
  const categoryClass = item.category.toLowerCase().replace(' ', '-');
  
  return (
    <div className="history-item">
      <div className="history-item-info">
        <div className="history-bmi">BMI: {item.bmi}</div>
        <div className="history-details">
          {item.height}{item.unit === 'metric' ? 'cm' : 'in'}, 
          {item.weight}{item.unit === 'metric' ? 'kg' : 'lbs'} - 
          {item.date} {item.time}
        </div>
      </div>
      <div className={`history-category category-${categoryClass}`}>
        {item.category}
      </div>
    </div>
  );
};

export default HistoryItem;