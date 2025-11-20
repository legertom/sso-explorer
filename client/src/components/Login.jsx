import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { login, error } = useAuth();

    return (
        <div className="container">
            <div className="header">
                <h1>🎓 Clever District SSO Explorer</h1>
                <p>Explore the data available from Clever's District SSO integration</p>

                <div id="login-section">
                    <button className="login-btn" onClick={login}>🔑 Login with Clever</button>
                </div>

                {error && (
                    <div className="error-message" style={{ marginTop: '20px' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
