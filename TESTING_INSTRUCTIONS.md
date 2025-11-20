# 🧪 Testing Instructions

Follow these steps to test the `refactor/sso-modernization` branch on your machine.

## 1. Switch to the Branch
Make sure you have the latest changes and switch to the feature branch:
```bash
git fetch origin
git checkout refactor/sso-modernization
git pull origin refactor/sso-modernization
```

## 2. Install Dependencies
Since we added a backend session library and a whole new frontend, you need to install dependencies in **two places**:

**Backend (Root):**
```bash
npm install
```

**Frontend (Client):**
```bash
cd client
npm install
cd ..
```

## 3. Verify Environment
Ensure your `.env` file in the root directory has the correct keys. Since you've run this before, it should already be there, but double-check:
```env
CLEVER_CLIENT_ID=...
CLEVER_CLIENT_SECRET=...
CLEVER_REDIRECT_URI=http://localhost:3000/auth/clever/callback
PORT=3000
SESSION_SECRET=your_secret_key
NODE_ENV=development
```

## 4. Run the App
Start the development server. This runs both the backend (port 3000) and frontend (port 5173) concurrently.
```bash
npm run dev
```

## 5. Verify Functionality
1.  Open **http://localhost:5173** (Vite Dev Server) or **http://localhost:3000** (Express Server - *Note: In dev mode, use port 5173 for hot reloading, but the backend runs on 3000*).
    *   *Recommendation*: Use **http://localhost:5173** for the best dev experience.
2.  Click **"Login with Clever"**.
3.  Complete the OAuth flow.
4.  Verify you land on the **Dashboard** and see your user/district data.
5.  **Refresh the page** to verify your session persists (cookies working).
6.  Click **Logout** and verify you are returned to the login screen.

## 6. (Optional) Test Production Build
To test exactly what will run in production:
```bash
# Build the React app
cd client
npm run build
cd ..

# Run the server in production mode
NODE_ENV=production node server.js
```
Then open **http://localhost:3000**.
