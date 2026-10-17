import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { RouterProvider, useRouter, ProtectedRoute } from './router/Router';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { FloatingMapButton } from './components/map/FloatingMapButton';
import { DeliveryMapModal } from './components/map/DeliveryMapModal';

// Customer Views
import { HomeView } from './views/customer/HomeView';
import { StoresView } from './views/customer/StoresView';
import { StoreDetailView } from './views/customer/StoreDetailView';
import { CartView } from './views/customer/CartView';
import { CheckoutView } from './views/customer/CheckoutView';
import { OrdersView } from './views/customer/OrdersView';
import { OrderDetailView } from './views/customer/OrderDetailView';
import { ProfileView } from './views/customer/ProfileView';
import { FavoritesView } from './views/customer/FavoritesView';

// Auth Views
import { LoginView } from './views/auth/LoginView';
import { RegisterView } from './views/auth/RegisterView';

// Role Dashboards
import { MerchantDashboardView } from './views/merchant/MerchantDashboardView';
import { CourierDashboardView } from './views/courier/CourierDashboardView';
import { CourierDeliveryView } from './views/courier/CourierDeliveryView';
import { AdminDashboardView } from './views/admin/AdminDashboardView';

// Subscriptions & Slick-Pay Payment Views
import { PricingPlansView } from './views/subscription/PricingPlansView';
import { MySubscriptionView } from './views/subscription/MySubscriptionView';
import { PaymentVerifyView } from './views/payment/PaymentVerifyView';
import { PaymentSuccessView } from './views/payment/PaymentSuccessView';
import { PaymentFailedView } from './views/payment/PaymentFailedView';
import { PaymentPendingView } from './views/payment/PaymentPendingView';
import { SatimMockView } from './views/payment/SatimMockView';

const AppContent: React.FC = () => {
  const { path, navigate } = useRouter();
  const { isMapOpen, closeMap, location, setLocation } = useLocation();

  const renderRoute = () => {
    // Exact & Param routes
    if (path === '/') return <HomeView />;
    if (path === '/stores') return <StoresView />;
    if (path.startsWith('/store/')) return <StoreDetailView />;
    if (path === '/cart') return <CartView />;
    if (path === '/checkout') return <CheckoutView />;
    if (path === '/orders') return <OrdersView />;
    if (path.startsWith('/orders/')) return <OrderDetailView />;
    if (path === '/favorites') return <FavoritesView />;
    if (path === '/profile') return <ProfileView />;

    // Subscriptions & Pricing
    if (path === '/pricing' || path === '/plans') return <PricingPlansView />;
    if (path === '/my-subscription' || path === '/subscription') return <MySubscriptionView />;

    // Slick-Pay & SATIM Payment Handlers
    if (path === '/payment/verify') return <PaymentVerifyView />;
    if (path === '/payment/success') return <PaymentSuccessView />;
    if (path === '/payment/failed') return <PaymentFailedView />;
    if (path === '/payment/pending') return <PaymentPendingView />;
    if (path === '/payment/satim-mock') return <SatimMockView />;

    // Auth
    if (path === '/login') return <LoginView />;
    if (path === '/register') return <RegisterView />;

    // Merchant
    if (path.startsWith('/merchant')) {
      return (
        <ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']}>
          <MerchantDashboardView />
        </ProtectedRoute>
      );
    }

    // Courier Dedicated Delivery View
    if (path.startsWith('/courier/deliveries/')) {
      return (
        <ProtectedRoute allowedRoles={['COURIER', 'ADMIN']}>
          <CourierDeliveryView onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    // Courier Dashboard
    if (path.startsWith('/courier')) {
      return (
        <ProtectedRoute allowedRoles={['COURIER', 'ADMIN']}>
          <CourierDashboardView onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    // Admin
    if (path.startsWith('/admin')) {
      return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboardView />
        </ProtectedRoute>
      );
    }

    // Default fallback
    return <HomeView />;
  };

  const isAuthPage = path === '/login' || path === '/register';
  const isCustomerInterface =
    !path.startsWith('/merchant') &&
    !path.startsWith('/courier') &&
    !path.startsWith('/admin') &&
    !isAuthPage;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#1A1A1B] selection:bg-[#F27D26]/20 selection:text-[#F27D26]">
      {/* Top Demo Persona Switcher */}
      <RoleSwitcher />

      {/* Main Navbar */}
      {!isAuthPage && <Navbar />}

      {/* Main Page View */}
      <main className="flex-1">{renderRoute()}</main>

      {/* Floating Map Button on Customer Views */}
      {isCustomerInterface && <FloatingMapButton />}

      {/* Floating Map Modal */}
      <DeliveryMapModal
        isOpen={isMapOpen}
        onClose={closeMap}
        initialLocation={location}
        onConfirm={setLocation}
      />

      {/* Mobile Bottom Navigation (Customers only) */}
      {isCustomerInterface && <MobileBottomNav />}

      {/* Footer (Hide on Auth and Courier navigation views) */}
      {!isAuthPage && !path.startsWith('/courier') && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <RouterProvider>
            <AppContent />
          </RouterProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
