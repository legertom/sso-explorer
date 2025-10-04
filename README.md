# 🎓 Clever District SSO Explorer

A comprehensive web application that demonstrates Clever's District SSO integration, allowing you to explore the rich data available through Clever's OAuth 2.0 authentication flow.

## 🌟 Features

- **Complete OAuth 2.0 Flow**: Secure authentication with Clever's District SSO
- **Rich Data Display**: Visualizes user profiles, district information, and contact details
- **Security First**: Rate limiting, helmet middleware, and proper token handling
- **Responsive Design**: Clean, modern interface that works on all devices
- **Real-time Data**: Live API responses from Clever's platform
- **Full Role Coverage**: Designed for district admins, teachers, staff, and students under District SSO

## 📊 Data Available

### User Information
- Clever User ID and profile details
- First/Last name and email address
- Account creation and modification dates
- User roles (district_admin, etc.)
- Associated district information

### District Details
- District Clever ID and name
- Portal URL and SIS type
- Geographic location (state)
- Launch date and last sync information
- Available login methods
- District contact information

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- A Clever developer account
- Registered Clever OAuth application

> **Production**: The live instance is hosted on Railway at https://sso-explorer-production.up.railway.app.

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd clever-print-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Clever OAuth credentials:
   ```env
   CLEVER_CLIENT_ID=your_clever_client_id_here
   CLEVER_CLIENT_SECRET=your_clever_client_secret_here
   CLEVER_REDIRECT_URI=http://localhost:3000/auth/clever/callback
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Local development notes

- The Clever app is configured with two redirect URIs:
  - `http://localhost:3000/auth/clever/callback` for local testing
  - `https://sso-explorer-production.up.railway.app/auth/clever/callback` for the production deployment on Railway
- Update your local `.env` with the development Client ID/Secret before running `npm run dev`.
- Production secrets are stored as Railway service variables; redeploy after any changes.

## 📁 Project Structure

```
clever-print-app/
├── public/
│   └── index.html          # Frontend application
├── server.js               # Express server with OAuth flow
├── package.json            # Dependencies and scripts
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔐 Security Features

- **Rate Limiting**: Prevents brute force attacks on auth endpoints
- **Helmet Middleware**: Adds security headers to all responses
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Validates OAuth codes and API responses
- **Token Truncation**: Access tokens are truncated in client display
- **CORS Protection**: Configured for secure cross-origin requests

## 🛠️ API Endpoints

### Authentication
- `GET /auth/clever` - Initiates OAuth flow with Clever
- `GET /auth/clever/callback` - Handles OAuth callback and token exchange

### Static Assets
- `GET /` - Serves the main application interface
- `GET /public/*` - Static file serving (CSS, JS, images)

## 🔍 How It Works

1. **User clicks "Login with Clever"** → Redirects to Clever's OAuth server
2. **User authenticates with Clever** → Clever redirects back with authorization code
3. **Server exchanges code for access token** → Makes secure server-to-server request
4. **Server fetches user data** → Parallel API calls to get user, profile, and district info
5. **Data displayed in browser** → Rich, formatted display of all available information

## 🐛 Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Ensure all variables in `.env.example` are set in your `.env` file
- Check that variable names match exactly (case-sensitive)

**"Invalid authorization code"**
- Verify your `CLEVER_REDIRECT_URI` matches exactly in both `.env` and Clever dashboard
- Ensure your Clever app is properly configured and active

**"Authentication failed"**
- Check your `CLEVER_CLIENT_ID` and `CLEVER_CLIENT_SECRET`
- Verify your Clever app has the required scopes enabled
- Check the server logs for detailed error information

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 📝 Development

### Available Scripts
- `npm start` - Run in production mode
- `npm run dev` - Run with nodemon for development
- `npm test` - Run tests (placeholder)

### Adding Features
The application is designed to be easily extensible:
- Add new data sections in [`public/index.html`](public/index.html)
- Extend API calls in the [`fetchCleverUserData()`](server.js:146) function
- Add new routes in [`server.js`](server.js) for additional functionality

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues related to:
- **This application**: Open a GitHub issue
- **Clever API**: Check [Clever's documentation](https://dev.clever.com/docs)
- **OAuth flow**: Review the [OAuth 2.0 specification](https://oauth.net/2/)

---

Built with ❤️ for exploring Clever's powerful District SSO capabilities.
