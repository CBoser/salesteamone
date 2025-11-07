import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

// Dashboard component (placeholder)
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MindFlow</h1>
              <span className="ml-4 text-sm text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                DEV MODE - Auth Disabled
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">
                    {user?.firstName || user?.email}
                  </span>
                  <span className="text-gray-500 text-sm">({user?.role})</span>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <span className="text-gray-500 text-sm">Not logged in</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome to MindFlow!
            </h2>
            {user ? (
              <>
                <p className="text-gray-600 mb-4">
                  You are logged in as <strong>{user?.email}</strong>
                </p>
              </>
            ) : (
              <p className="text-gray-600 mb-4">
                <strong>Development Mode:</strong> Authentication is disabled.
                You can freely build features without logging in.
              </p>
            )}
            <p className="text-gray-500 text-sm">
              This is a placeholder dashboard. Foundation Layer features coming soon...
            </p>
            <div className="mt-6 space-x-4">
              <a
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Test Login
              </a>
              <a
                href="/register"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Test Register
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth routes - kept for testing */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main dashboard - NO AUTH REQUIRED (Development Mode) */}
          <Route path="/" element={<Dashboard />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
