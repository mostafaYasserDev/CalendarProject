import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuthStore } from './stores/authStore';

// Lazy load components
const Calendar = lazy(() => import('./pages/Calendar'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Calendar />} />
          <Route 
            path="dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard /> : 
                <Navigate to="/login" state={{ from: '/dashboard' }} />
            } 
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;