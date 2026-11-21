import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, Product } from '../types';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  subtotal: number;
  shippingCharge: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      // Guest cart handled in localStorage
      const local = localStorage.getItem('guest_cart');
      if (local) {
        try {
          setCart(JSON.parse(local));
        } catch {
          setCart(null);
        }
      }
      return;
    }

    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success) {
        setCart(res.data);
      }
    } catch (error) {
      console.warn('Failed to load cart from server:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (product: Product, quantity = 1): Promise<boolean> => {
    if (product.stock < quantity) {
      toast.error(`Only ${product.stock} items available in stock`);
      return false;
    }

    if (!isAuthenticated) {
      // Guest Cart logic
      let currentItems: CartItem[] = cart ? [...cart.items] : [];
      const existingIdx = currentItems.findIndex((i) => i.productId === product.id);

      if (existingIdx > -1) {
        const newQty = currentItems[existingIdx].quantity + quantity;
        if (newQty > product.stock) {
          toast.error(`Only ${product.stock} items left in stock`);
          return false;
        }
        currentItems[existingIdx].quantity = newQty;
        currentItems[existingIdx].lineTotal = newQty * product.price;
      } else {
        currentItems.push({
          id: `guest_${Date.now()}_${Math.random()}`,
          productId: product.id,
          quantity,
          product,
          lineTotal: quantity * product.price,
        });
      }

      const subtotal = currentItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
      const shippingCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
      const total = subtotal + shippingCharge;

      const updatedCart: Cart = {
        id: 'guest_cart',
        items: currentItems,
        itemCount: currentItems.reduce((acc, curr) => acc + curr.quantity, 0),
        subtotal,
        shippingCharge,
        total,
      };

      const shortTitle =
        product.name.length > 40 ? product.name.slice(0, 37) + '...' : product.name;

      setCart(updatedCart);
      localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
      toast.success(`Added ${shortTitle} to cart`, {
        id: `cart-${product.id}`,
        icon: '🛍️',
        style: {
          background: '#0c0d14',
          color: '#f5f4ef',
          fontFamily: 'Space Mono',
          fontSize: '12px',
        },
      });
      return true;
    }

    try {
      const res = await cartService.addItem(product.id, quantity);
      if (res.success) {
        setCart(res.data);
        const shortTitle =
          product.name.length > 40 ? product.name.slice(0, 37) + '...' : product.name;
        toast.success(`Added ${shortTitle} to cart`, {
          id: `cart-${product.id}`,
          icon: '🛍️',
          style: {
            background: '#0c0d14',
            color: '#f5f4ef',
            fontFamily: 'Space Mono',
            fontSize: '12px',
          },
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add item to cart');
      return false;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    if (!isAuthenticated) {
      if (!cart) return;
      const currentItems = cart.items.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity,
            lineTotal: quantity * item.product.price,
          };
        }
        return item;
      });

      const subtotal = currentItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
      const shippingCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
      const total = subtotal + shippingCharge;

      const updatedCart: Cart = {
        ...cart,
        items: currentItems,
        itemCount: currentItems.reduce((acc, curr) => acc + curr.quantity, 0),
        subtotal,
        shippingCharge,
        total,
      };

      setCart(updatedCart);
      localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
      return;
    }

    try {
      const res = await cartService.updateItem(cartItemId, quantity);
      if (res.success) {
        setCart(res.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!isAuthenticated) {
      if (!cart) return;
      const currentItems = cart.items.filter((i) => i.id !== cartItemId);
      const subtotal = currentItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
      const shippingCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
      const total = subtotal + shippingCharge;

      const updatedCart: Cart = {
        ...cart,
        items: currentItems,
        itemCount: currentItems.reduce((acc, curr) => acc + curr.quantity, 0),
        subtotal,
        shippingCharge,
        total,
      };

      setCart(updatedCart);
      localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
      toast.success('Item removed from cart');
      return;
    }

    try {
      const res = await cartService.removeItem(cartItemId);
      if (res.success) {
        setCart(res.data);
        toast.success('Item removed from cart');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      localStorage.removeItem('guest_cart');
      return;
    }

    try {
      await cartService.clearCart();
      setCart({
        id: cart?.id || '',
        items: [],
        itemCount: 0,
        subtotal: 0,
        shippingCharge: 0,
        total: 0,
      });
    } catch (error: any) {
      console.warn('Failed to clear cart:', error);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount: cart?.itemCount || 0,
        subtotal: cart?.subtotal || 0,
        shippingCharge: cart?.shippingCharge || 0,
        total: cart?.total || 0,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
