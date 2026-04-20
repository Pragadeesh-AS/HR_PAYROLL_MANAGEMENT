import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextDefinition";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force default to admin user regardless of local storage state
    const mockAdmin = {
      id: 1,
      name: "Admin",
      email: "admin@company.com",
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff",
    };
    const mockToken = "mock-jwt-token-" + Date.now();
    localStorage.setItem("user", JSON.stringify(mockAdmin));
    localStorage.setItem("token", mockToken);
    setUser(mockAdmin);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Mock authentication - replace with actual API call
      const { email, password, role } = credentials;

      // Basic validation
      if (!password) {
        throw new Error("Password is required");
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const mockUser = {
        id: Date.now(),
        name: email.split("@")[0],
        email,
        role: role || "employee",
        avatar: `https://ui-avatars.com/api/?name=${email.split("@")[0]}&background=2563eb&color=fff`,
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("token", mockToken);

      setUser(mockUser);
      return mockUser;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  };

  const register = async (userData) => {
    try {
      // Mock registration - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: "employee",
        avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=2563eb&color=fff`,
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", mockToken);

      setUser(newUser);
      return newUser;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
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
