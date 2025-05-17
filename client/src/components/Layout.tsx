import React from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import UserMenu from "./UserMenu";
import LocalAdminButton from "./LocalAdminButton";
const Layout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuthStore();

  // Redirect to login if trying to access dashboard without authentication
  if (location.pathname === "/dashboard" && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-primary-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-lalezar flex justify-between items-center">
            CRISOD
            <img
              src="/logo.png"
              alt="industrial security logo"
              className="logo"
            />
          </h1>

          {isAuthenticated && <UserMenu />}
        </div>
      </header>

      <div className="flex flex-1">
        {isAuthenticated && location.pathname === "/dashboard" && (
          <nav className="w-16 md:w-56 bg-white shadow-md">
            <div className="p-4 flex flex-col items-center md:items-start space-y-6">
              <Link
                to="/"
                className="flex items-center gap-2 p-2 rounded-md w-full transition-colors hover:bg-gray-100"
              >
                <LayoutDashboard size={20} />
                <span className="hidden md:inline-block">View Calendar</span>
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-2 p-2 rounded-md w-full transition-colors hover:bg-gray-100 text-red-500"
              >
                <LogOut size={20} />
                <span className="hidden md:inline-block">Logout</span>
              </button>
            </div>
          </nav>
        )}

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <LocalAdminButton />
    </div>
  );
};

export default Layout;
