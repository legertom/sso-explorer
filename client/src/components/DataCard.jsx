import React from 'react';

const DataCard = ({ title, value, isLink }) => {
    return (
        <div className="data-card">
            <h4>{title}</h4>
            <div className="value">
                {isLink && value !== 'N/A' ? (
                    <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                ) : (
                    value
                )}
            </div>
        </div>
    );
};

export default DataCard;
