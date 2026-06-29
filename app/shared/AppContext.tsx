'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAPI } from './api'; // Changed this line

export type UserRole = 'customer' | 'provider' | 'admin';
export type ExperienceCategory =
  | 'adventure'
  | 'relaxation'
  | 'nightlife'
  | 'cultural'
  | 'wildlife'
  | 'water_sports'
  | 'romantic'
  | 'family_friendly';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Experience {
  experienceId: string;
  providerId: string;
  title: string;
  description: string;
  destination: string;
  destinationSlug: string;
  category: ExperienceCategory;
  eventDate: string;
  numberOfDays: number;
  price: number;
  currency: string;
  duration: string;
  maxGroupSize: number;
  images: string[];
  featured: boolean;
  status: string;
}

export interface CartItem {
  experience: Experience;
  requestedDate: string;
  groupSize: number;
  notes: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  cart: CartItem[];
  savedIds: string[];
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => void;
  addToCart: (
    experience: Experience,
    requestedDate: string,
    groupSize: number,
    notes: string,
  ) => void;
  removeFromCart: (experienceId: string) => void;
  updateCartItem: (experienceId: string, updates: Partial<Omit<CartItem, 'experience'>>) => void;
  clearCart: () => void;
  toggleSaveExperience: (experienceId: string) => Promise<void>;
  isSaved: (experienceId: string) => boolean;
  syncSavedWithBackend: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Load state from localStorage on client render
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedCart = localStorage.getItem('cart');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    setLoading(false);
  }, []);

  // Sync saved experiences list if token is present
  useEffect(() => {
    if (token && user && user.role !== 'provider') {
      syncSavedWithBackend().catch(console.error);
    } else {
      setSavedIds([]);
    }
  }, [token, user]);

  const syncSavedWithBackend = async () => {
    try {
      const savedList = await fetchAPI<Experience[]>('/api/saved');
      setSavedIds(savedList.map((exp) => exp.experienceId));
    } catch (error) {
      console.error('Failed to sync saved experiences', error);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await fetchAPI<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  // In AppContext.tsx, update the register function signature and implementation:

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: UserRole,
    providerData?: {
      businessName: string;
      description: string;
      location: string;
      businessAddress: string;
      companyEmail: string;
      companyPhone: string;
      cacNumber: string;
      cacDocumentUrl?: string;
    },
  ) => {
    const payload: any = { firstName, lastName, email, password, role };

    if (role === 'provider' && providerData) {
      payload.businessName = providerData.businessName;
      payload.description = providerData.description;
      payload.location = providerData.location;
      payload.businessAddress = providerData.businessAddress;
      payload.companyEmail = providerData.companyEmail;
      payload.companyPhone = providerData.companyPhone;
      payload.cacNumber = providerData.cacNumber;
      if (providerData.cacDocumentUrl) {
        payload.cacDocumentUrl = providerData.cacDocumentUrl;
      }
    }

    const data = await fetchAPI<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSavedIds([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Cart operations
  const addToCart = (
    experience: Experience,
    requestedDate: string,
    groupSize: number,
    notes: string,
  ) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.experience.experienceId === experience.experienceId,
      );

      let newCart: CartItem[];
      if (existingIndex > -1) {
        newCart = [...prevCart];
        newCart[existingIndex] = {
          experience,
          requestedDate,
          groupSize,
          notes,
        };
      } else {
        newCart = [...prevCart, { experience, requestedDate, groupSize, notes }];
      }

      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (experienceId: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.experience.experienceId !== experienceId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartItem = (experienceId: string, updates: Partial<Omit<CartItem, 'experience'>>) => {
    setCart((prevCart) => {
      const newCart = prevCart.map((item) => {
        if (item.experience.experienceId === experienceId) {
          return { ...item, ...updates };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Saved (wishlist) operations
  const toggleSaveExperience = async (experienceId: string) => {
    if (!token) {
      throw new Error('You must be logged in to save experiences.');
    }

    const isAlreadySaved = savedIds.includes(experienceId);

    if (isAlreadySaved) {
      // Remove
      await fetchAPI(`/api/saved/${experienceId}`, {
        method: 'DELETE',
      });
      setSavedIds((prev) => prev.filter((id) => id !== experienceId));
    } else {
      // Add
      await fetchAPI(`/api/saved/${experienceId}`, {
        method: 'POST',
      });
      setSavedIds((prev) => [...prev, experienceId]);
    }
  };

  const isSaved = (experienceId: string) => {
    return savedIds.includes(experienceId);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        loading,
        cart,
        savedIds,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        toggleSaveExperience,
        isSaved,
        syncSavedWithBackend,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
