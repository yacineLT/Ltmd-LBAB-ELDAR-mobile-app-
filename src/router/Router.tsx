import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to extract path params (e.g. /store/:storeId or /orders/:orderId)
  const extractParams = (path: string): Record<string, string> => {
    const parts = path.split('/').filter(Boolean);
    const params: Record<string, string> = {};

    if (parts[0] === 'store' && parts[1]) {
      params.storeId = parts[1];
    } else if (parts[0] === 'orders' && parts[1]) {
      params.orderId = parts[1];
    } else if (parts[0] === 'courier' && parts[1] === 'deliveries' && parts[2]) {
      params.deliveryId = parts[2];
    }
    return params;
  };

  return (
    <RouterContext.Provider
      value={{
        path: currentPath,
        navigate,
        params: extractParams(currentPath),
        searchParams: new URLSearchParams(window.location.search),
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export const Link: React.FC<{
  to: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  id?: string;
}> = ({ to, className, children, onClick, id }) => {
  const { navigate } = useRouter();

  return (
    <a
      id={id}
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
};

// Route Guard Component
export const ProtectedRoute: React.FC<{
  allowedRoles: UserRole[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { currentUser, role, isAuthenticated, isLoading } = useAuth();
  const { navigate } = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-neutral-200 text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold mb-2">تسجيل الدخول مطلوب</h2>
        <p className="text-neutral-600 mb-6 text-sm">
          يرجى تسجيل الدخول للوصول إلى هذه الصفحة المحمية
        </p>
        <button
          id="btn-login-redirect"
          onClick={() => navigate('/login')}
          className="w-full py-3 bg-[#FF6600] text-white font-semibold rounded-xl hover:bg-[#E65C00] transition"
        >
          الانتقال لصفحة تسجيل الدخول
        </button>
      </div>
    );
  }

  // Admin has access to all roles
  const hasAccess = role === 'ADMIN' || (role && allowedRoles.includes(role));

  if (!hasAccess) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-red-100 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ✕
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">غير مصرح بالدخول</h2>
        <p className="text-neutral-600 mb-4 text-sm leading-relaxed">
          حسابك الحالي برتبة <span className="font-bold text-[#FF6600]">{role}</span> ليس لديه
          الصلاحيات للوصول إلى هذا القسم.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="btn-unauthorized-home"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-neutral-100 text-neutral-800 rounded-xl hover:bg-neutral-200 text-sm font-medium"
          >
            العودة للرئيسية
          </button>
          <button
            id="btn-unauthorized-switch"
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-[#FF6600] text-white rounded-xl hover:bg-[#E65C00] text-sm font-medium"
          >
            تبديل الحساب
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
