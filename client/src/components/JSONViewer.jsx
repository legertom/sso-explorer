import React, { useState } from 'react';

const JSONViewer = ({ data, label }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <button className="toggle-btn" onClick={() => setVisible(!visible)}>
                {visible ? `Hide ${label}` : `Show ${label}`}
            </button>
            <div className={`json-viewer ${visible ? '' : 'hidden'}`}>
                {JSON.stringify(data, null, 2)}
            </div>
        </div>
    );
};

export default JSONViewer;
