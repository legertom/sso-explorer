import React from 'react';
import { useAuth } from '../hooks/useAuth';
import DataCard from './DataCard';
import JSONViewer from './JSONViewer';

const Dashboard = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const { authInfo, userProfile, district } = user;
    const userData = userProfile.data;
    const districtData = district.data;
    const contact = districtData.district_contact;

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

    return (
        <div className="container">
            <div className="header">
                <h1>🎓 Clever District SSO Explorer</h1>
                <p>Explore the data available from Clever's District SSO integration</p>
            </div>

            {/* Auth Status */}
            <div className="data-section">
                <h2 className="section-header">✅ Authentication Status</h2>
                <div className="section-content">
                    <p>Successfully authenticated with Clever District SSO! <span className="success-badge">CONNECTED</span></p>
                    <p><strong>Access Token:</strong> <code>{authInfo.token}</code></p>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
            </div>

            {/* User Profile Section */}
            <div className="data-section">
                <h2 className="section-header">👤 Your Profile</h2>
                <div className="section-content">
                    <div className="data-grid">
                        <DataCard title="Clever User ID" value={userData.id} />
                        <DataCard title="First Name" value={userData.name?.first} />
                        <DataCard title="Last Name" value={userData.name?.last} />
                        <DataCard title="Email Address" value={userData.email} />
                        <DataCard title="Account Created" value={formatDate(userData.created)} />
                        <DataCard title="Last Modified" value={formatDate(userData.last_modified)} />
                        <DataCard title="User Roles" value={userData.roles ? Object.keys(userData.roles).join(', ') : 'N/A'} />
                        <DataCard title="District ID" value={userData.district} />
                    </div>
                    <JSONViewer data={userProfile} label="User JSON" />
                </div>
            </div>

            {/* District Section */}
            <div className="data-section">
                <h2 className="section-header">🏛️ District Information</h2>
                <div className="section-content">
                    <div className="data-grid">
                        <DataCard title="Clever District ID" value={districtData.id} />
                        <DataCard title="District Name" value={districtData.name} />
                        <DataCard title="Portal URL" value={districtData.portal_url} isLink={true} />
                        <DataCard title="SIS Type" value={districtData.sis_type} />
                        <DataCard title="State" value={districtData.state} />
                        <DataCard title="Launch Date" value={formatDate(districtData.launch_date)} />
                        <DataCard title="Last Sync" value={formatDate(districtData.last_sync)} />
                        <DataCard title="Login Methods" value={districtData.login_methods?.join(', ')} />
                    </div>
                    <JSONViewer data={district} label="District JSON" />
                </div>
            </div>

            {/* District Contact Section */}
            <div className="data-section">
                <h2 className="section-header">📞 District Contact</h2>
                <div className="section-content">
                    <div className="data-grid">
                        <DataCard title="Contact ID" value={contact?.id || 'N/A'} />
                        <DataCard title="Contact Name" value={contact?.name ? `${contact.name.first} ${contact.name.last}` : 'N/A'} />
                        <DataCard title="Contact Email" value={contact?.email || 'N/A'} />
                        <DataCard title="Contact Title" value={contact?.title || 'N/A'} />
                    </div>
                </div>
            </div>

            {/* Limitations Section */}
            <div className="limitations-box">
                <div className="limitations-title">📋 Available Data Fields</div>
                <p>Your app successfully retrieved all these fields from Clever's District SSO:</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                    <div>
                        <strong>✅ User Fields:</strong>
                        <ul className="available-list">
                            <li>User Clever ID</li>
                            <li>First Name & Last Name</li>
                            <li>Email Address</li>
                            <li>Account Created Date</li>
                            <li>Last Modified Date</li>
                            <li>User Roles (district_admin, etc.)</li>
                            <li>Associated District ID</li>
                        </ul>
                    </div>
                    <div>
                        <strong>✅ District Fields:</strong>
                        <ul className="available-list">
                            <li>District Clever ID</li>
                            <li>District Name</li>
                            <li>Portal URL</li>
                            <li>SIS Type</li>
                            <li>District State</li>
                            <li>Launch Date</li>
                            <li>Last Sync Date</li>
                            <li>Login Methods</li>
                            <li>District Contact Info</li>
                        </ul>
                    </div>
                </div>

                <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
                    <strong>Note:</strong> This is much more comprehensive than the basic District SSO fields typically documented. You have access to rich user and district metadata!
                </p>
            </div>

            {/* Complete Data Dump */}
            <div className="data-section">
                <h2 className="section-header">🔍 Complete API Response</h2>
                <div className="section-content">
                    <p>This is the complete JSON response from Clever's API:</p>
                    <JSONViewer data={user} label="Complete Response" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
