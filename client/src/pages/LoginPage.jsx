import React, { useState } from "react";
import axios from "axios";
import API_URL from "../apiConfig";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { Toaster, toast } from "sonner";

// Image import
import profIcon from "../assets/proflocatorLogo.jpg";

const LoginPage = () => {
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/users/login`, {
        email,
        password,
      });
      const { token } = res.data;
      login(token);
      toast.success("Logged in successfully.");
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      toast.error(
        err.response?.data?.msg || "Login failed. Check your details."
      );
    }
  };

  if (user.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Right Side - Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
            {/* Mobile Logo (Only visible on mobile) */}

            <div className="mb-1 text-center">
              <h1 className="text-3xl font-bold text-blue-600 mb-1">
                PROFLOCATOR
              </h1>
              <p className="text-gray-600 text-sm">
                Track Proffesor Availability
              </p>
            </div>

            <div className="mb-1 flex justify-center">
              <img
                className="h-40 w-40"
                src={profIcon}
                alt="Proflocator Icon"
              />
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="example@ccc.edu.ph"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    minLength="5"
                    required
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              {/* <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div> */}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Footer */}
          {/* <div className="mt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 PROFLOCATOR. All rights reserved.</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
