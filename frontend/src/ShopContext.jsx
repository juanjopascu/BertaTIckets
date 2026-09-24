import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext(null);

const API_BASE_URL = `http://${window.location.hostname}:3001`;

export function ShopProvider({ children }) {
  // ── Cart ──
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shop_cart') || '[]'); } catch { return []; }
  });

  // ── Auth ──
  const [shopUser, setShopUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shop_user') || 'null'); } catch { return null; }
  });
  const [shopToken, setShopToken] = useState(() => localStorage.getItem('shop_token') || null);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
  }, [cart]);

  // ── Cart actions ──
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);

  // ── Auth actions ──
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');
    localStorage.setItem('shop_token', data.token);
    localStorage.setItem('shop_user', JSON.stringify(data.user));
    setShopToken(data.token);
    setShopUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrarse');
    // Auto-login after register
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('shop_token');
    localStorage.removeItem('shop_user');
    setShopToken(null);
    setShopUser(null);
  };

  return (
    <ShopContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal,
      shopUser, shopToken, login, register, logout,
      API_BASE_URL,
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}
