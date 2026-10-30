import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { dbService } from '../services/store';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    role: 'CUSTOMER' | 'MERCHANT' | 'COURIER';
    password?: string;
    storeName?: string;
    vehicleType?: 'MOTORCYCLE' | 'CAR' | 'BICYCLE' | 'VAN';
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'lbab_dar_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check persistent session from actual logged in user
    const storedUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUserId) {
      const user = dbService.getUserById(storedUserId);
      if (user && user.isActive) {
        setCurrentUser(user);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setIsLoading(false);

    // Subscribe to DB updates
    const unsubscribe = dbService.subscribe(() => {
      if (currentUser) {
        const fresh = dbService.getUserById(currentUser.id);
        if (fresh) setCurrentUser(fresh);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, _pass: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const user = dbService.getUserByEmail(email.trim());

    if (!user) {
      setIsLoading(false);
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    if (!user.isActive) {
      setIsLoading(false);
      return { success: false, error: 'هذا الحساب معطل مؤقتاً، يرجى التواصل مع إدارة المنصة' };
    }

    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    setIsLoading(false);
    return { success: true, user };
  };

  const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    role: 'CUSTOMER' | 'MERCHANT' | 'COURIER';
    password?: string;
    storeName?: string;
    vehicleType?: 'MOTORCYCLE' | 'CAR' | 'BICYCLE' | 'VAN';
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const existing = dbService.getUserByEmail(data.email.trim());
    if (existing) {
      setIsLoading(false);
      return { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل' };
    }

    // Role cannot be ADMIN
    if ((data.role as string) === 'ADMIN') {
      setIsLoading(false);
      return { success: false, error: 'لا يمكن تسجيل حساب مسؤول جديد مباشرة' };
    }

    const newUserId = 'user_' + Math.random().toString(36).substring(2, 9);
    let storeId: string | undefined;
    let courierId: string | undefined;

    // If Merchant, bootstrap store
    if (data.role === 'MERCHANT') {
      storeId = 'store_' + Math.random().toString(36).substring(2, 9);
      dbService.createStore({
        id: storeId,
        merchantId: newUserId,
        name: data.storeName || 'متجر ' + data.fullName,
        description: 'متجر مسجل في منصة لباب الدار، مرحباً بكم!',
        category: 'cat_restaurants',
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80',
        phone: data.phone,
        wilaya: 'الجزائر العاصمة',
        commune: 'سيدي امحمد',
        address: 'العنوان التجاري',
        rating: 5.0,
        reviewCount: 0,
        deliveryTimeMin: 25,
        deliveryTimeMax: 40,
        deliveryFee: 250,
        minimumOrder: 500,
        isOpen: true,
        isVerified: false,
        isFeatured: false,
        openingHours: '09:00 - 22:00',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // If Courier, bootstrap courier profile
    if (data.role === 'COURIER') {
      courierId = 'courier_' + Math.random().toString(36).substring(2, 9);
      dbService.createCourier({
        id: courierId,
        userId: newUserId,
        fullName: data.fullName,
        phone: data.phone,
        vehicleType: data.vehicleType || 'MOTORCYCLE',
        wilaya: 'الجزائر العاصمة',
        isOnline: true,
        totalDeliveries: 0,
        rating: 5.0,
        earningsBalance: 0,
        isApproved: false,
        createdAt: new Date().toISOString(),
      });
    }

    const newUser: User = {
      id: newUserId,
      email: data.email.trim(),
      fullName: data.fullName,
      phone: data.phone,
      role: data.role,
      storeId,
      courierId,
      isActive: true,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbService.createUser(newUser);
    setCurrentUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    setIsLoading(false);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    const user = dbService.getUserByEmail(email.trim());
    if (!user) {
      return { success: false, message: 'لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني' };
    }
    return {
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.',
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
