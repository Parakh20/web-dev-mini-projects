import React from 'react';
import HistoryItem from './HistoryItem';

const BMIHistory = ({ history, onClearHistory }) => {
  if (!history.length) return null;

  return (
    <div className="history-section">
      <div className="card">
        <div className="card__body">
          <div className="history-header">
            <h2>BMI History</h2>
            <button 
              type="button" 
              className="btn btn--sm btn--outline"
              onClick={onClearHistory}
            >
              Clear History
            </button>
          </div>
          <div className="history-list">
            {history.map((item, index) => (
              <HistoryItem key={index} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMIHistory;