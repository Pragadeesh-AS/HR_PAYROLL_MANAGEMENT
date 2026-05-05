import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextDefinition";
import { authService } from "../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      if (!credentials.password) {
        throw new Error("Password is required");
      }

      const response = await authService.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      setUser(user);
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.error || `Login failed: ${error.message}`);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response.data; // Note: Doesn't auto login, user has to login
    } catch (error) {
      throw new Error(error.response?.data?.error || `Registration failed: ${error.message}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isHR: user?.role === "hr",
    isEmployee: user?.role === "employee",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
