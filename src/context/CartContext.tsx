import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Store } from '../types';
import { dbService } from '../services/store';
import { ReplaceCartModal } from '../components/cart/ReplaceCartModal';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  store: Store | null;
  addToCart: (product: Product, quantity?: number, notes?: string) => boolean;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  promoCode: string;
  applyPromo: (code: string) => { success: boolean; message: string };
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'lbab_dar_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  // Multi-store conflict state
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<{
    product: Product;
    quantity: number;
    notes?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.items && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          setStoreId(parsed.storeId || null);
          setPromoCode(parsed.promoCode || '');
          setDiscount(parsed.discount || 0);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveCart = (newItems: CartItem[], newStoreId: string | null, newPromo = promoCode, newDisc = discount) => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items: newItems,
          storeId: newStoreId,
          promoCode: newPromo,
          discount: newDisc,
        })
      );
    } catch {
      // ignore
    }
  };

  const store = storeId ? dbService.getStoreById(storeId) || null : null;
  const pendingStore = pendingItem ? dbService.getStoreById(pendingItem.product.storeId) || null : null;

  const addToCart = (product: Product, quantity = 1, notes?: string): boolean => {
    // If cart has items from another store
    if (storeId && storeId !== product.storeId && items.length > 0) {
      setPendingItem({ product, quantity, notes });
      setConflictModalOpen(true);
      return false;
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    let newItems: CartItem[];

    if (existingIndex > -1) {
      newItems = items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
          : item
      );
    } else {
      newItems = [...items, { product, quantity, notes }];
    }

    setItems(newItems);
    setStoreId(product.storeId);
    saveCart(newItems, product.storeId);
    return true;
  };

  const handleConfirmReplace = () => {
    if (!pendingItem) return;
    const newItems = [{ product: pendingItem.product, quantity: pendingItem.quantity, notes: pendingItem.notes }];
    setItems(newItems);
    setStoreId(pendingItem.product.storeId);
    setPromoCode('');
    setDiscount(0);
    saveCart(newItems, pendingItem.product.storeId, '', 0);
    setConflictModalOpen(false);
    setPendingItem(null);
  };

  const handleCancelReplace = () => {
    setConflictModalOpen(false);
    setPendingItem(null);
  };

  const updateQuantity = (productId: string, delta: number) => {
    let newItems = items
      .map((item) => {
        if (item.product.id === productId) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    const newStoreId = newItems.length > 0 ? storeId : null;
    setItems(newItems);
    setStoreId(newStoreId);
    saveCart(newItems, newStoreId);
  };

  const removeFromCart = (productId: string) => {
    const newItems = items.filter((item) => item.product.id !== productId);
    const newStoreId = newItems.length > 0 ? storeId : null;
    setItems(newItems);
    setStoreId(newStoreId);
    saveCart(newItems, newStoreId);
  };

  const clearCart = () => {
    setItems([]);
    setStoreId(null);
    setPromoCode('');
    setDiscount(0);
    saveCart([], null, '', 0);
  };

  const applyPromo = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (clean === 'LBAB10' || clean === 'DAR2026' || clean === 'MARHABA') {
      const calcDiscount = Math.round(subtotal * 0.1);
      setPromoCode(clean);
      setDiscount(calcDiscount);
      saveCart(items, storeId, clean, calcDiscount);
      return { success: true, message: 'تم تطبيق كود الخصم بنجاح (-10%)!' };
    }
    return { success: false, message: 'رمز القسيمة غير صالح أو منتهي الصلاحية' };
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = store?.deliveryFee ?? (items.length > 0 ? 250 : 0);
  const total = Math.max(0, subtotal + deliveryFee - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        store,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        discount,
        promoCode,
        applyPromo,
        total,
      }}
    >
      {children}
      <ReplaceCartModal
        isOpen={conflictModalOpen}
        currentStoreName={store?.name || 'المتجر الحالي'}
        newStoreName={pendingStore?.name || 'المتجر الجديد'}
        onConfirm={handleConfirmReplace}
        onCancel={handleCancelReplace}
      />
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
