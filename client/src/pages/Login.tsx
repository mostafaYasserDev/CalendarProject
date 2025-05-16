import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import LocalAdminButton from "../components/LocalAdminButton";
import { authAPI } from "../services/api";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    const getUsername = async () => {
      try {
        const username = await authAPI.getSystemUsername();
        console.log('System Username:', username);
      } catch (error) {
        console.error('Failed to get system username:', error);
      }
    };
    getUsername();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);

      if (success) {
        navigate(from, { replace: true });
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-scale-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full text-primary-600 mb-4">
            <Calendar size={28} />
          </div>
          <h2 className="text-3xl font-lalezar text-gray-900">Login</h2>
          <p className="mt-2 text-gray-600">Welcome back.</p>
        </div>

        <div className="bg-white py-8 px-4 md:px-6 shadow-md rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <LocalAdminButton />
    </div>
  );
};

export default Login;
