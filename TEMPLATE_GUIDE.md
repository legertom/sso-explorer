# 🚀 Clever App Starter Template

This repository is designed to be a "stub app" or starter template for building internal Clever applications. It comes pre-configured with:

*   **Secure Authentication**: Full OAuth 2.0 flow with Clever, using secure `HttpOnly` cookies and server-side sessions.
*   **Modern Frontend**: React 19 + Vite for a fast, component-based UI.
*   **Solid Backend**: Node.js + Express with a modular MVC architecture.
*   **Production Ready**: configured for security (Helmet, Rate Limiting) and deployment.

## 🛠 Quick Start for New Apps

1.  **Clone & Rename**
    ```bash
    git clone https://github.com/clever/sso-explorer.git my-new-app
    cd my-new-app
    rm -rf .git # Remove the old git history
    git init    # Start a fresh git repo
    ```

2.  **Install Dependencies**
    You need to install dependencies for both the backend (root) and frontend (`client/`).
    ```bash
    npm install           # Install backend deps
    cd client && npm install # Install frontend deps
    cd ..
    ```

3.  **Configure Environment**
    Copy the example environment file and add your Clever Client ID/Secret.
    ```bash
    cp .env.example .env
    ```
    *Edit `.env` with your credentials from the [Clever Dashboard](https://apps.clever.com/).*

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    This will start the backend on port 3000 and the frontend on port 5173.

## 🏗 Architecture Overview

### Backend (`/`)
*   **`server.js`**: Entry point. Sets up middleware (Session, CORS, Helmet) and serves the React app in production.
*   **`src/config/`**: Centralized configuration. **Add new env vars here.**
*   **`src/routes/`**: Express routes. Separated into `auth` and `api`.
*   **`src/controllers/`**: Business logic.
    *   `authController.js`: Handles Clever login/logout.
    *   `apiController.js`: Proxies requests to Clever API using the stored session token.

### Frontend (`/client`)
*   **`vite.config.js`**: Configured to proxy `/auth` and `/api` requests to the backend during development.
*   **`src/hooks/useAuth.jsx`**: A powerful hook that manages the user's login state.
    ```javascript
    const { user, loading, login, logout } = useAuth();
    ```
*   **`src/components/`**: React components.

## 🧩 How to Customize

### 1. Rename the Project
Update the `name` field in both `package.json` and `client/package.json`.

### 2. Add Your Own API Routes
To add a new feature (e.g., "Classroom Sync"):
1.  Create `src/controllers/classroomController.js`.
2.  Add a route in `src/routes/index.js`:
    ```javascript
    router.get('/api/classrooms', requireAuth, classroomController.list);
    ```

### 3. Build Your UI
1.  Delete the demo content in `client/src/components/Dashboard.jsx`.
2.  Build your new views using the `user` object from `useAuth()` to get the current user's context (District ID, User ID, etc.).

### 4. Accessing Clever API
The backend already handles token management. To make calls to Clever from the backend:
*   Use the `req.session.token` available in any route protected by authentication.
*   See `src/controllers/apiController.js` for examples of fetching data from Clever.

## 🚢 Deployment

The app is set up to be deployed as a single Node.js application.

1.  **Build the Frontend**:
    ```bash
    cd client
    npm run build
    ```
    This compiles React into `client/dist`.

2.  **Start the Server**:
    ```bash
    NODE_ENV=production node server.js
    ```
    The Express server will serve the static files from `client/dist` and handle all API requests.

## 🔒 Security Notes for Production
*   **Session Store**: By default, this uses `MemoryStore` for sessions. **For production, you must use a persistent store** like Redis or MongoDB to prevent memory leaks and keep users logged in across restarts.
    *   *Recommendation*: Use `connect-redis`.
*   **HTTPS**: Ensure you deploy behind a load balancer or proxy (like Nginx or AWS ALB) that terminates HTTPS. The session cookies are set to `Secure: true` in production.
