import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

const DEFAULT_CHECKOUT_METHODS = {
  shipping: [
    { id: 'express', enabled: true, title: 'Envío Express a Domicilio', subtitle: 'Despacho a Planta / Oficina', badge: 'Recomendado', icon: 'truck', priceText: 'Bonificado (B2B)', description: 'Despacho prioritario directo a domicilio u obra.' },
    { id: 'hub', enabled: true, title: 'Retiro en HUB DACAS', subtitle: 'Depósito Central (Sin Cargo)', badge: 'Gratis', icon: 'building', priceText: 'Sin cargo', description: 'Retiro presencial inmediato en HUB Central.' },
    { id: 'expreso', enabled: true, title: 'Expreso / Transporte Propio', subtitle: 'Despacho a receptoría de expreso', badge: 'Interior', icon: 'truck', priceText: 'A cargo del cliente', description: 'Envío coordinado mediante transporte o expreso seleccionado.' }
  ],
  payment: [
    {
      id: 'cuenta_corriente',
      enabled: true,
      title: 'Cuenta Corriente Comercial B2B DACAS',
      subtitle: 'Pago diferido contra factura y límite crediticio asignado a tu empresa.',
      icon: 'bank',
      terms: ['30_dias', '60_dias'],
      terms_label: 'Plazo de Facturación:',
      instrucciones: 'Sujeto a verificación de línea crediticia aprobada en DACAS.'
    },
    {
      id: 'transferencia',
      enabled: true,
      title: 'Transferencia Bancaria Directa (CBU / SWIFT)',
      subtitle: 'Se emitirá la Factura Proforma con cuentas en BBVA / Banco Santander para depósito en USD o ARS al tipo de cambio oficial.',
      badge: 'Inmediato',
      icon: 'credit-card',
      banco: 'Banco Santander / BBVA Argentina',
      titular: 'DACAS S.A.',
      cuit: '30-68942158-9',
      cbu: '0720123920000001234567',
      alias: 'DACAS.PAGOS.B2B',
      swift: 'BAPROARBAXXX',
      tipo_cuenta: 'Cuenta Corriente Especial en USD / ARS',
      instrucciones: 'Una vez efectuada la transferencia, adjuntá el comprobante a cobranzas@dacas.com indicando tu número de orden.'
    },
    {
      id: 'tarjeta',
      enabled: true,
      title: 'Tarjeta Corporativa / Débito (Stripe Secure)',
      subtitle: 'Procesamiento online seguro e inmediato con Visa, Mastercard, American Express B2B.',
      badge: 'Online',
      icon: 'credit-card',
      gateway: 'Stripe SSL 256-bit',
      instrucciones: 'Transacción encriptada y protegida bajo normativa PCI-DSS Nivel 1.'
    },
    {
      id: 'echeq',
      enabled: true,
      title: 'Cheque de Pago Diferido / E-Cheq',
      subtitle: 'Endoso y recepción de cheques electrónicos interbancarios COELSA.',
      badge: 'Financiamiento',
      icon: 'file-text',
      cuit_receptor: '30-68942158-9',
      banco_receptor: 'Banco Santander',
      plazos_admitidos: '30 y 60 días fecha factura',
      instrucciones: 'Emitir o endosar el E-Cheq a favor de DACAS S.A. (CUIT 30-68942158-9) mediante homebanking.'
    }
  ],
  terms_conditions_text: 'Acepto las condiciones comerciales de DACAS B2B, términos de garantía oficial de fabricante de 12/36 meses y la emisión de la orden de compra con carácter vinculante para reserva de stock.'
};

export default function ShopCheckout() {
  const navigate = useNavigate();

  // ── Checkout Methods (configurable from Admin) ──
  const [checkoutMethods, setCheckoutMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_checkout_methods');
      return saved ? JSON.parse(saved) : DEFAULT_CHECKOUT_METHODS;
    } catch {
      return DEFAULT_CHECKOUT_METHODS;
    }
  });

  const [copiedKey, setCopiedKey] = useState(null);
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ecommerce/settings/checkout-methods`)
      .then(r => r.json())
      .then(data => {
        if (data && (data.shipping || data.payment)) {
          setCheckoutMethods(data);
          try {
            localStorage.setItem('dacas_checkout_methods', JSON.stringify(data));
          } catch {}

          const activeShip = (data.shipping || []).filter(s => s.enabled !== false);
          if (activeShip.length > 0 && !activeShip.some(s => s.id === shippingMethod)) {
            setShippingMethod(activeShip[0].id);
          }
          const activePay = (data.payment || []).filter(p => p.enabled !== false);
          if (activePay.length > 0 && !activePay.some(p => p.id === paymentMethod)) {
            setPaymentMethod(activePay[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  // ── Cart State synced with localStorage ──
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_shop_cart') || localStorage.getItem('shop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveCart = (newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem('dacas_shop_cart', JSON.stringify(newCart));
      localStorage.setItem('shop_cart', JSON.stringify(newCart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = cart.map(i => i.id === id ? { ...i, qty } : i);
    saveCart(updated);
  };

  const removeFromCart = (id) => {
    const updated = cart.filter(i => i.id !== id);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartTotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.qty, 0);

  // ── Coupon / Promotional Code State ──
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const discountAmount = appliedCoupon ? (parseFloat(appliedCoupon.discount_amount) || 0) : 0;
  const finalOrderTotal = Math.max(0, cartTotal - discountAmount);

  // Helper to retrieve active user from any storage key
  const getActiveUser = () => {
    try {
      const u1 = localStorage.getItem('dacas_client_user');
      if (u1) return JSON.parse(u1);
      const u2 = localStorage.getItem('shop_user');
      if (u2) return JSON.parse(u2);
      const u3 = localStorage.getItem('usuario');
      if (u3) return JSON.parse(u3);
      return null;
    } catch {
      return null;
    }
  };

  // ── Auth State synced with localStorage ──
  const [shopUser, setShopUser] = useState(() => getActiveUser());
  const [shopToken, setShopToken] = useState(() => localStorage.getItem('dacas_client_token') || localStorage.getItem('shop_token') || localStorage.getItem('token') || null);

  // Onboarding Steps: 'cart' (1) | 'billing' (2) | 'shipping' (3) | 'payment' (4) | 'success' (5)
  const [step, setStep] = useState('cart');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  // Quick Login Modal / Accordion for non-authenticated clients
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Handle Apply Coupon
  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponInput || !couponInput.trim()) {
      setCouponError('Ingresá un código de cupón');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const activeToken = shopToken || localStorage.getItem('dacas_client_token');
      const payload = {
        code: couponInput.trim().toUpperCase(),
        user_id: shopUser?.id || null,
        country_id: shopUser?.country_id || 1,
        items: cart,
        subtotal: cartTotal
      };

      const res = await fetch(`${API_BASE_URL}/api/ecommerce/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Cupón inválido o no aplicable.');
      }

      setAppliedCoupon(data.coupon);
      setCouponSuccess(`¡Cupón "${data.coupon.code}" aplicado con éxito! Descuento: -$${data.coupon.discount_amount} USD (${data.coupon.discount_display})`);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message || 'Error al validar cupón.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
  };

  // ── Step 2: Billing & Corporate Fiscal Data ──
  const [billing, setBilling] = useState(() => {
    const u = getActiveUser();
    const nameVal = u?.nombre || u?.name || '';
    const emailVal = u?.email || '';
    const empresaVal = u?.razon_social || u?.empresa || u?.organizacion || u?.company || nameVal || '';
    const cuitVal = u?.cuit || u?.tax_id || u?.numero_nit || u?.identificacion_fiscal || u?.rut || u?.dni || '';
    const phoneVal = u?.telefono || u?.phone || u?.contacto_telefono || u?.tel || '';
    const tipoFacturaVal = u?.tipo_factura || u?.tipo_comprobante || 'Factura A (Responsable Inscripto)';
    const condicionIvaVal = u?.condicion_iva || u?.tipo_iva || 'IVA Responsable Inscripto';

    return {
      empresa: empresaVal,
      cuit: cuitVal,
      tipo_factura: tipoFacturaVal,
      condicion_iva: condicionIvaVal,
      contacto_nombre: nameVal,
      contacto_email: emailVal,
      contacto_telefono: phoneVal,
      po_number: '',
    };
  });

  // ── Step 3: Shipping & Logistics ──
  const [shippingMethod, setShippingMethod] = useState('express'); // 'express' | 'hub' | 'expreso'
  const [shipping, setShipping] = useState(() => {
    const u = getActiveUser();
    const nameVal = u?.nombre || u?.name || '';
    const phoneVal = u?.telefono || u?.phone || u?.contacto_telefono || u?.tel || '';
    const direccionVal = u?.direccion_entrega || u?.direccion_legal || u?.direccion || u?.domicilio || '';
    const ciudadVal = u?.ciudad || u?.city || '';
    const provinciaVal = u?.provincia || u?.state || 'Buenos Aires';
    const paisVal = u?.pais || u?.country || 'Argentina';
    const cpVal = u?.codigo_postal || u?.cp || u?.zip || '';

    return {
      calle: direccionVal,
      numero: '',
      piso_depto: '',
      ciudad: ciudadVal,
      codigo_postal: cpVal,
      provincia: provinciaVal,
      pais: paisVal,
      contacto_recepcion: nameVal,
      telefono_recepcion: phoneVal,
      horario_entrega: '9:00 a 18:00 hs',
      expreso_nombre: '',
      expreso_guia: '',
      instrucciones: '',
    };
  });

  // ── Step 4: Payment & Commercial Conditions ──
  const [paymentMethod, setPaymentMethod] = useState('cuenta_corriente'); // 'cuenta_corriente' | 'transferencia' | 'tarjeta' | 'echeq'
  const [ccTerms, setCcTerms] = useState('30_dias');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Auto-populate / Sync when user logs in or steps change
  useEffect(() => {
    const u = getActiveUser();
    if (u) {
      setShopUser(u);

      const nameVal = u.nombre || u.name || '';
      const emailVal = u.email || '';
      const empresaVal = u.razon_social || u.empresa || u.organizacion || u.company || nameVal || '';
      const cuitVal = u.cuit || u.tax_id || u.numero_nit || u.identificacion_fiscal || u.rut || u.dni || '';
      const phoneVal = u.telefono || u.phone || u.contacto_telefono || u.tel || '';
      const tipoFacturaVal = u.tipo_factura || u.tipo_comprobante || 'Factura A (Responsable Inscripto)';
      const condicionIvaVal = u.condicion_iva || u.tipo_iva || 'IVA Responsable Inscripto';

      setBilling(prev => ({
        ...prev,
        empresa: prev.empresa || empresaVal,
        cuit: prev.cuit || cuitVal,
        contacto_nombre: prev.contacto_nombre || nameVal,
        contacto_email: prev.contacto_email || emailVal,
        contacto_telefono: prev.contacto_telefono || phoneVal,
        tipo_factura: prev.tipo_factura || tipoFacturaVal,
        condicion_iva: prev.condicion_iva || condicionIvaVal,
      }));

      const direccionVal = u.direccion_entrega || u.direccion_legal || u.direccion || u.domicilio || '';
      const ciudadVal = u.ciudad || u.city || '';
      const provinciaVal = u.provincia || u.state || 'Buenos Aires';
      const paisVal = u.pais || u.country || 'Argentina';
      const cpVal = u.codigo_postal || u.cp || u.zip || '';

      setShipping(prev => ({
        ...prev,
        calle: prev.calle || direccionVal,
        ciudad: prev.ciudad || ciudadVal,
        provincia: prev.provincia || provinciaVal,
        pais: prev.pais || paisVal,
        codigo_postal: prev.codigo_postal || cpVal,
        contacto_recepcion: prev.contacto_recepcion || nameVal,
        telefono_recepcion: prev.telefono_recepcion || phoneVal,
      }));
    }
  }, [step]);

  // Handle Quick Login
  const handleQuickLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');

      localStorage.setItem('dacas_client_user', JSON.stringify(data.user));
      localStorage.setItem('dacas_client_token', data.token);
      localStorage.setItem('shop_user', JSON.stringify(data.user));
      localStorage.setItem('shop_token', data.token);

      setShopUser(data.user);
      setShopToken(data.token);
      setShowLoginModal(false);
    } catch (err) {
      setLoginError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError('El carrito no contiene productos.');
      return;
    }
    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones comerciales para confirmar.');
      return;
    }

    setLoading(true);
    setError('');

    const formattedAddress = shippingMethod === 'hub'
      ? 'Retiro en HUB Logístico Central DACAS (Buenos Aires)'
      : shippingMethod === 'expreso'
        ? `Expreso ${shipping.expreso_nombre || 'Contratado'} - ${shipping.calle} ${shipping.numero}, ${shipping.ciudad} (${shipping.codigo_postal})`
        : `${shipping.calle} ${shipping.numero} ${shipping.piso_depto ? `Piso ${shipping.piso_depto}` : ''}, ${shipping.ciudad} (${shipping.codigo_postal}), ${shipping.provincia}`;

    const paymentMethodLabel = paymentMethod === 'cuenta_corriente'
      ? `Cuenta Corriente B2B (${ccTerms === '30_dias' ? '30 días fecha factura' : '60 días fecha factura'})`
      : paymentMethod === 'transferencia'
        ? 'Transferencia Bancaria Inmediata (CBU / SWIFT)'
        : paymentMethod === 'tarjeta'
          ? 'Tarjeta de Crédito Corporativa (Stripe SSL)'
          : 'E-Cheq / Cheque de Pago Diferido';

    try {
      const activeToken = shopToken || localStorage.getItem('dacas_client_token');
      const orderPayload = {
        items: cart.map(i => ({ id: i.id, quantity: i.qty, qty: i.qty })),
        payment_method: paymentMethodLabel,
        shipping_method: shippingMethod === 'hub' ? 'Retiro en Depósito Central' : shippingMethod === 'expreso' ? 'Expreso Transporte' : 'Envío Express a Domicilio',
        shipping_address: formattedAddress,
        billing_info: billing,
        po_number: billing.po_number || `OC-${Math.floor(1000 + Math.random() * 9000)}`,
        delivery_notes: shipping.instrucciones || '',
        notes: `Horario: ${shipping.horario_entrega}. Receptor: ${shipping.contacto_recepcion} (${shipping.telefono_recepcion})`,
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      };

      if (activeToken) {
        const res = await fetch(`${API_BASE_URL}/api/ecommerce/client/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify(orderPayload),
        });
        const data = await res.json();
        if (res.ok && data.order) {
          setCreatedOrder(data.order);
          clearCart();
          setStep('success');
          return;
        }
      }

      // Offline / Simulated Fallback
      await new Promise(r => setTimeout(r, 1200));
      const simulatedOrder = {
        id: Math.floor(Math.random() * 9000) + 1000,
        total: finalOrderTotal.toFixed(2),
        subtotal: cartTotal.toFixed(2),
        discount_applied: discountAmount.toFixed(2),
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        status: 'procesando',
        payment_method: paymentMethodLabel,
        shipping_method: orderPayload.shipping_method,
        shipping_address: formattedAddress,
        tracking_number: `DACAS-LOG-AR-${Math.floor(Math.random() * 9000) + 1000}`,
        po_number: orderPayload.po_number,
        created_at: new Date().toISOString(),
        items: cart.map(i => ({
          product_id: i.id,
          product_name: i.name,
          sku: i.sku || 'SKU-GEN',
          brand: i.brand || 'DACAS',
          quantity: i.qty,
          price_at_purchase: parseFloat(i.price).toFixed(2),
          image_url: i.image_url || '',
        })),
      };

      setCreatedOrder(simulatedOrder);
      clearCart();
      setStep('success');
    } catch {
      setError('Hubo un error procesando tu orden de compra. Por favor reintentá.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { key: 'cart', num: 1, label: 'Carro & Cotización', icon: 'shopping-cart' },
    { key: 'billing', num: 2, label: 'Datos Fiscales & Ficha', icon: 'building' },
    { key: 'shipping', num: 3, label: 'Logística & Despacho', icon: 'truck' },
    { key: 'payment', num: 4, label: 'Pago & Condiciones', icon: 'credit-card' },
    { key: 'success', num: 5, label: 'Orden Confirmada', icon: 'award' },
  ];

  const currentStepIdx = stepsList.findIndex(s => s.key === step);

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid #E2E8F0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '14px',
    fontFamily: 'inherit',
    background: '#FFFFFF',
    color: '#071524',
    transition: 'all 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", minHeight: '100vh', background: '#F4F7FA', color: '#071524' }}>

      {/* ── Top Corporate Header ── */}
      <header style={{ background: '#071524', borderBottom: '1px solid rgba(15, 164, 222, 0.25)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <div onClick={() => navigate('/shop')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '18px', boxShadow: '0 4px 12px rgba(15, 164, 222, 0.4)' }}>
              D
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.15rem', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                DACAS <span style={{ color: '#0fa4de' }}>ECOMMERCE</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>Portal B2B de Compras & Proformas</div>
            </div>
          </div>

          {/* User status badge / Login trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {shopUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0fa4de', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '800' }}>
                  {shopUser.name?.charAt(0) || 'C'}
                </div>
                <div style={{ fontSize: '12px', textAlign: 'left' }}>
                  <div style={{ color: '#FFFFFF', fontWeight: '700' }}>{shopUser.empresa || shopUser.razon_social || shopUser.nombre || shopUser.name}</div>
                  <div style={{ color: '#0fa4de', fontSize: '10px', fontWeight: '600' }}>
                    {shopUser.cuit || shopUser.numero_nit || shopUser.tax_id ? `CUIT: ${shopUser.cuit || shopUser.numero_nit || shopUser.tax_id} · ` : ''}
                    Nivel {shopUser.nivel || 'Mayorista B2B'}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                style={{ background: 'rgba(15, 164, 222, 0.15)', border: '1px solid #0fa4de', color: '#38BDF8', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <BrandingVectorIcon name="key" size={14} color="#38BDF8" />
                <span>¿Ya tenés cuenta? Iniciar Sesión</span>
              </button>
            )}

            <button
              onClick={() => navigate('/shop')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#CBD5E1', padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              ← Volver al Shop
            </button>
          </div>
        </div>
      </header>

      {/* ── Interactive Onboarding Stepper Bar ── */}
      <div className="no-print" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '12px', paddingBottom: '4px' }}>
          {stepsList.map((s, idx) => {
            const isCompleted = currentStepIdx > idx;
            const isCurrent = currentStepIdx === idx;
            const isClickable = idx < currentStepIdx && step !== 'success';

            return (
              <div
                key={s.key}
                onClick={() => isClickable && setStep(s.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: isClickable ? 'pointer' : 'default',
                  opacity: isCurrent ? 1 : isCompleted ? 0.95 : 0.45,
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isCurrent ? '#0fa4de' : isCompleted ? '#10B981' : '#F1F5F9',
                  color: isCurrent || isCompleted ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '13px',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(15, 164, 222, 0.2)' : 'none',
                }}>
                  {isCompleted ? (
                    <BrandingVectorIcon name="check-circle" size={18} color="#FFFFFF" />
                  ) : (
                    <BrandingVectorIcon name={s.icon} size={17} color={isCurrent ? '#FFFFFF' : '#64748B'} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>Paso {s.num}</div>
                  <div style={{ fontSize: '13px', fontWeight: isCurrent ? '800' : '600', color: isCurrent ? '#071524' : '#64748B' }}>
                    {s.label}
                  </div>
                </div>
                {idx < stepsList.length - 1 && (
                  <div style={{ width: '30px', height: '2px', background: isCompleted ? '#10B981' : '#E2E8F0', margin: '0 8px' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Error Alert */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '14px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrandingVectorIcon name="alert-circle" size={16} color="#991B1B" />
            <span>{error}</span>
          </div>
        )}

        {/* ── ONBOARDING STEP 5: SUCCESS / CONFIRMED PROFORMA ── */}
        {step === 'success' && createdOrder && (
          <div className="printable-proforma proforma-container ecommerce-proforma-voucher" style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>

            {/* Header Voucher */}
            <div style={{ paddingBottom: '28px', borderBottom: '2px solid #071524', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0fa4de', letterSpacing: '-0.02em' }}>DACAS S.A.</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#071524' }}>Distribuidor Mayorista de Valor Agregado B2B</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>CUIT: 30-68942158-9 · IVA Responsable Inscripto</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Av. del Libertador 4500, CABA · ventas@dacas.com · www.dacas.com</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: '#071524', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginBottom: '6px', letterSpacing: '0.04em' }}>
                  FACTURA PROFORMA B2B
                </div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#0fa4de' }}>ORDEN #{createdOrder.id}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Fecha: {new Date(createdOrder.created_at || Date.now()).toLocaleDateString()}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Validez de Oferta: 15 días corridos</div>
              </div>
            </div>

            {/* Visual Tracking Stepper (Hidden on Print) */}
            <div className="no-print" style={{ padding: '28px 0', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>
                Estado Actual del Pedido en Tiempo Real
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                {[
                  { title: '1. Pedido Registrado', desc: 'Validación de Stock', status: 'done', icon: 'file-text' },
                  { title: '2. Ficha & Crédito', desc: 'Aprobación Comercial', status: 'current', icon: 'search' },
                  { title: '3. Picking & Armado', desc: 'Preparación IT', status: 'box' },
                  { title: '4. En Despacho', desc: 'Guía de Transporte', status: 'pending', icon: 'truck' },
                ].map(st => (
                  <div key={st.title} style={{
                    background: st.status === 'done' ? '#ECFDF5' : st.status === 'current' ? '#EFF6FF' : '#F8FAFC',
                    border: `1.5px solid ${st.status === 'done' ? '#10B981' : st.status === 'current' ? '#0fa4de' : '#E2E8F0'}`,
                    borderRadius: '16px',
                    padding: '16px',
                  }}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                      <BrandingVectorIcon name={st.icon} size={24} color={st.status === 'done' ? '#059669' : st.status === 'current' ? '#0284C7' : '#94A3B8'} />
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: st.status === 'done' ? '#065F46' : st.status === 'current' ? '#0369A1' : '#64748B' }}>
                      {st.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{st.desc}</div>
                    <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: st.status === 'done' ? '#059669' : st.status === 'current' ? '#0284C7' : '#94A3B8' }}>
                      {st.status === 'done' ? 'Completado' : st.status === 'current' ? 'En Proceso' : 'Pendiente'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voucher Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', padding: '20px 0', borderBottom: '1px solid #F1F5F9', fontSize: '12px' }}>
              <div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Código de Seguimiento</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0fa4de', marginTop: '2px' }}>{createdOrder.tracking_number || `DACAS-LOG-AR-${createdOrder.id}`}</div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Condición de Pago</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#071524', marginTop: '2px' }}>{createdOrder.payment_method || 'Cuenta Corriente Comercial'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Modalidad de Despacho</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#071524', marginTop: '2px' }}>{createdOrder.shipping_method || 'Envío a Domicilio'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Destino / Entrega</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginTop: '2px' }}>{createdOrder.shipping_address}</div>
              </div>
            </div>

            {/* Items Summary Table */}
            <div style={{ padding: '20px 0', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 14px', color: '#071524' }}>Detalle de Productos Cotizados</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#071524', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', borderRadius: '6px 0 0 6px' }}>Producto / Descripción</th>
                    <th style={{ padding: '10px 12px' }}>Marca / SKU</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Cantidad</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Precio Unitario</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {createdOrder.items?.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: '#071524' }}>{item.product_name}</td>
                      <td style={{ padding: '10px 12px', color: '#64748B' }}>{item.brand || 'DACAS'} · {item.sku || 'SKU-DACAS'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B' }}>${parseFloat(item.price_at_purchase).toFixed(2)} USD</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0fa4de' }}>
                        ${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)} USD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Breakdown & Bank Wire Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '16px', alignItems: 'start' }}>
                <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '14px', fontSize: '11.5px', color: '#0369A1' }}>
                  <div style={{ fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BrandingVectorIcon name="bank" size={14} color="#0369A1" />
                    <span>Cuentas Bancarias DACAS S.A. para Transferencias:</span>
                  </div>
                  <div>Banco: <strong>Banco Santander / BBVA</strong></div>
                  <div>CBU: <strong>0720123920000001234567</strong> | Alias: <strong>DACAS.PAGOS.B2B</strong></div>
                  <div>SWIFT: <strong>BAPROARBAXXX</strong> | CUIT: <strong>30-68942158-9</strong></div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px 20px', borderRadius: '12px', textAlign: 'right', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Subtotal B2B: <strong>${createdOrder.subtotal || createdOrder.total} USD</strong></div>
                  <div style={{ fontSize: '12px', color: '#10B981', marginBottom: '8px' }}>Descuentos aplicados: <strong>-${createdOrder.discount_applied || '0.00'} USD</strong></div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#071524', borderTop: '1.5px solid #E2E8F0', paddingTop: '8px' }}>
                    Total Final: <span style={{ color: '#0fa4de' }}>${parseFloat(createdOrder.total).toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (Hidden during Print) */}
            <div className="no-print" style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                }}
              >
                <BrandingVectorIcon name="printer" size={16} color="#ffffff" />
                <span>Imprimir / Guardar como PDF</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/shop/portal')}
                style={{
                  background: '#071524',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <BrandingVectorIcon name="user" size={16} color="#ffffff" />
                <span>Ver en Mi Panel de Cliente →</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/shop')}
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 24px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Volver al Catálogo
              </button>
            </div>
          </div>
        )}

        {/* ── STEPS 1 TO 4 (Checkout Onboarding Layout) ── */}
        {step !== 'success' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

            {/* Left Column: Current Onboarding Step Content */}
            <div>

              {/* ─────────────────────────────────────────────
                  STEP 1: CARRO & REVISIÓN DE COTIZACIÓN
              ───────────────────────────────────────────── */}
              {step === 'cart' && (
                <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BrandingVectorIcon name="shopping-cart" size={24} color="#0fa4de" />
                        <span>1. Carro de Compras & Cotización B2B</span>
                      </h2>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                        Revisá los productos agregados, cantidades y precios por cliente corporativo.
                      </p>
                    </div>
                    <span style={{ background: '#F1F5F9', color: '#071524', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>
                      {cart.reduce((s, i) => s + i.qty, 0)} ítems
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                        <BrandingVectorIcon name="shopping-cart" size={56} color="#94A3B8" />
                      </div>
                      <h3 style={{ margin: '0 0 8px', color: '#071524', fontSize: '1.2rem', fontWeight: '800' }}>Tu carrito está vacío</h3>
                      <p style={{ margin: '0 0 24px', fontSize: '14px' }}>Agregá equipos o licencias desde nuestro catálogo mayorista.</p>
                      <button
                        onClick={() => navigate('/shop')}
                        style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 28px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)' }}
                      >
                        Explorar Catálogo de Equipos →
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cart.map(item => (
                          <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #F1F5F9', alignItems: 'center' }}>

                            {/* Image Thumbnail */}
                            <div style={{ width: '70px', height: '70px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              ) : (
                                <BrandingVectorIcon name="box" size={24} color="#94A3B8" />
                              )}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ background: 'rgba(15, 164, 222, 0.12)', color: '#0284C7', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                                  {item.brand || 'DACAS'}
                                </span>
                                <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>SKU: {item.sku || `PROD-${item.id}`}</span>
                              </div>
                              <div style={{ fontWeight: '800', fontSize: '14px', color: '#071524', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>● En Stock para Despacho</span>
                                <span style={{ color: '#CBD5E1' }}>•</span>
                                <span style={{ fontSize: '13px', color: '#64748B' }}>${parseFloat(item.price).toFixed(2)} USD / un.</span>
                              </div>
                            </div>

                            {/* Quantity buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                              <button
                                onClick={() => updateQty(item.id, item.qty - 1)}
                                style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#F1F5F9', color: '#071524', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                −
                              </button>
                              <span style={{ fontWeight: '800', minWidth: '24px', textAlign: 'center', fontSize: '14px' }}>{item.qty}</span>
                              <button
                                onClick={() => updateQty(item.id, item.qty + 1)}
                                style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#F1F5F9', color: '#071524', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                +
                              </button>
                            </div>

                            {/* Total Line */}
                            <div style={{ textAlign: 'right', minWidth: '100px' }}>
                              <div style={{ fontWeight: '900', fontSize: '15px', color: '#071524' }}>
                                ${(parseFloat(item.price) * item.qty).toFixed(2)}
                              </div>
                              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>USD Total</div>
                            </div>

                            {/* Delete */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Quitar"
                            >
                              <BrandingVectorIcon name="trash-2" size={16} color="#94A3B8" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Step 1 Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                        <button
                          onClick={() => navigate('/shop')}
                          style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                        >
                          ← Agregar más productos
                        </button>
                        <button
                          onClick={() => setStep('billing')}
                          style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px 32px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(15, 164, 222, 0.35)' }}
                        >
                          Continuar a Datos Fiscales & Facturación →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────
                  STEP 2: DATOS FISCALES & FACTURACIÓN
              ───────────────────────────────────────────── */}
              {step === 'billing' && (
                <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BrandingVectorIcon name="building" size={24} color="#0fa4de" />
                      <span>2. Datos Fiscales & Facturación Corporativa</span>
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                      Completá la información impositiva para la emisión de la Factura Oficial y Remito comercial.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                    {/* Razón Social */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={labelStyle}>Razón Social / Nombre de la Empresa *</label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder="Ej. Soluciones Tecnológicas S.A."
                        value={billing.empresa}
                        onChange={e => setBilling({ ...billing, empresa: e.target.value })}
                        required
                      />
                    </div>

                    {/* CUIT */}
                    <div>
                      <label style={labelStyle}>CUIT / Tax ID / Identificación Fiscal *</label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder="Ej. 30-12345678-9"
                        value={billing.cuit}
                        onChange={e => setBilling({ ...billing, cuit: e.target.value })}
                        required
                      />
                    </div>

                    {/* Tipo de Comprobante */}
                    <div>
                      <label style={labelStyle}>Tipo de Comprobante Requerido</label>
                      <select
                        style={inputStyle}
                        value={billing.tipo_factura}
                        onChange={e => setBilling({ ...billing, tipo_factura: e.target.value })}
                      >
                        <option value="Factura A (Responsable Inscripto)">Factura A (Responsable Inscripto)</option>
                        <option value="Factura B (Consumidor Final / Exento)">Factura B (Consumidor Final / Exento)</option>
                        <option value="Factura E (Exportación de Servicios / Mercadería)">Factura E (Exportación Internacional)</option>
                      </select>
                    </div>

                    {/* Condición de IVA */}
                    <div>
                      <label style={labelStyle}>Condición ante el IVA</label>
                      <select
                        style={inputStyle}
                        value={billing.condicion_iva}
                        onChange={e => setBilling({ ...billing, condicion_iva: e.target.value })}
                      >
                        <option value="IVA Responsable Inscripto">IVA Responsable Inscripto</option>
                        <option value="IVA Sujeto Exento">IVA Sujeto Exento</option>
                        <option value="Monotributo">Monotributo</option>
                        <option value="Cliente del Exterior / Sin Residencia">Cliente del Exterior</option>
                      </select>
                    </div>

                    {/* Orden de Compra Interna */}
                    <div>
                      <label style={labelStyle}>N° de Orden de Compra Interna (Opcional)</label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder="Ej. OC-2026-904"
                        value={billing.po_number}
                        onChange={e => setBilling({ ...billing, po_number: e.target.value })}
                      />
                    </div>

                    {/* Contacto Administrativo */}
                    <div>
                      <label style={labelStyle}>Contacto de Compras / Finanzas *</label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder="Ej. Lic. Laura Gutiérrez"
                        value={billing.contacto_nombre}
                        onChange={e => setBilling({ ...billing, contacto_nombre: e.target.value })}
                        required
                      />
                    </div>

                    {/* Email Facturación */}
                    <div>
                      <label style={labelStyle}>Email para Envío de Factura Electrónica *</label>
                      <input
                        type="email"
                        style={inputStyle}
                        placeholder="pagos@empresa.com"
                        value={billing.contacto_email}
                        onChange={e => setBilling({ ...billing, contacto_email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={() => setStep('cart')}
                      style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                    >
                      ← Volver al Carrito
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!billing.empresa || !billing.cuit) {
                          setError('Por favor completá la Razón Social y CUIT de la empresa.');
                          return;
                        }
                        setError('');
                        setStep('shipping');
                      }}
                      style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px 32px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(15, 164, 222, 0.35)' }}
                    >
                      Continuar a Logística & Despacho →
                    </button>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────
                  STEP 3: LOGÍSTICA & DESPACHO
              ───────────────────────────────────────────── */}
              {step === 'shipping' && (
                <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BrandingVectorIcon name="truck" size={24} color="#0fa4de" />
                      <span>3. Logística, Despacho y Entrega</span>
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                      Seleccioná el método de entrega de la mercadería y completá el destino.
                    </p>
                  </div>

                  {/* Shipping Method Cards */}
                  {(() => {
                    const activeShipping = (checkoutMethods?.shipping || []).filter(m => m.enabled !== false);
                    if (activeShipping.length === 0) {
                      return (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BrandingVectorIcon name="alert-triangle" size={16} color="#991B1B" />
                          <span>No hay métodos de envío habilitados actualmente por la administración.</span>
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, activeShipping.length))}, 1fr)`, gap: '14px', marginBottom: '28px' }}>
                        {activeShipping.map(m => {
                          const isSel = shippingMethod === m.id;
                          return (
                            <div
                              key={m.id}
                              onClick={() => setShippingMethod(m.id)}
                              style={{
                                background: isSel ? '#F0F9FF' : '#FFFFFF',
                                border: `2px solid ${isSel ? '#0fa4de' : '#E2E8F0'}`,
                                borderRadius: '16px',
                                padding: '18px 16px',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <BrandingVectorIcon name={m.icon || 'truck'} size={24} color={isSel ? '#0fa4de' : '#64748B'} />
                                {m.badge && (
                                  <span style={{ background: isSel ? '#0fa4de' : '#F1F5F9', color: isSel ? '#fff' : '#64748B', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                                    {m.badge}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontWeight: '800', fontSize: '13px', color: '#071524', marginBottom: '4px' }}>{m.title}</div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>{m.subtitle || m.description || ''}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Delivery Address Fields (if not HUB pickup) */}
                  {shippingMethod !== 'hub' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Calle o Avenida de Destino *</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="Av. del Libertador"
                          value={shipping.calle}
                          onChange={e => setShipping({ ...shipping, calle: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Altura / Número *</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="6300"
                          value={shipping.numero}
                          onChange={e => setShipping({ ...shipping, numero: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Piso / Dpto / Dársena</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="Piso 4 - Dpto B"
                          value={shipping.piso_depto}
                          onChange={e => setShipping({ ...shipping, piso_depto: e.target.value })}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Ciudad / Municipio *</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="Buenos Aires"
                          value={shipping.ciudad}
                          onChange={e => setShipping({ ...shipping, ciudad: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Código Postal *</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="C1428ART"
                          value={shipping.codigo_postal}
                          onChange={e => setShipping({ ...shipping, codigo_postal: e.target.value })}
                          required
                        />
                      </div>

                      {shippingMethod === 'expreso' && (
                        <div style={{ gridColumn: 'span 3', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '14px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#071524', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BrandingVectorIcon name="building" size={16} color="#0fa4de" />
                            <span>Datos del Transporte / Expreso Contratado</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <label style={labelStyle}>Nombre de la Empresa de Transporte *</label>
                              <input
                                type="text"
                                style={inputStyle}
                                placeholder="Ej. Expreso Cruz del Sur / Sevillanita"
                                value={shipping.expreso_nombre}
                                onChange={e => setShipping({ ...shipping, expreso_nombre: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>N° de Cuenta / Remito Cliente en Expreso</label>
                              <input
                                type="text"
                                style={inputStyle}
                                placeholder="Ej. CTA-884920"
                                value={shipping.expreso_guia}
                                onChange={e => setShipping({ ...shipping, expreso_guia: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label style={labelStyle}>Persona Autorizada a Recibir *</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="Ej. Ing. Martín Gómez"
                          value={shipping.contacto_recepcion}
                          onChange={e => setShipping({ ...shipping, contacto_recepcion: e.target.value })}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Teléfono de Contacto en Destino *</label>
                        <input
                          type="tel"
                          style={inputStyle}
                          placeholder="+54 11 4455-6677"
                          value={shipping.telefono_recepcion}
                          onChange={e => setShipping({ ...shipping, telefono_recepcion: e.target.value })}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Franja Horaria de Recepción</label>
                        <select
                          style={inputStyle}
                          value={shipping.horario_entrega}
                          onChange={e => setShipping({ ...shipping, horario_entrega: e.target.value })}
                        >
                          <option value="9:00 a 18:00 hs (Horario Corrido)">9:00 a 18:00 hs (Horario Corrido)</option>
                          <option value="9:00 a 13:00 hs (Turno Mañana)">9:00 a 13:00 hs (Turno Mañana)</option>
                          <option value="14:00 a 18:00 hs (Turno Tarde)">14:00 a 18:00 hs (Turno Tarde)</option>
                        </select>
                      </div>

                      <div style={{ gridColumn: 'span 3' }}>
                        <label style={labelStyle}>Instrucciones Especiales para Logística (Opcional)</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="Ej. Ingresar por dársena de carga, anunciar en portería técnica..."
                          value={shipping.instrucciones}
                          onChange={e => setShipping({ ...shipping, instrucciones: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {shippingMethod === 'hub' && (
                    <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(15, 164, 222, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BrandingVectorIcon name="building" size={26} color="#0fa4de" />
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: '#071524' }}>Centro de Distribución Central DACAS (Buenos Aires HUB)</div>
                          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Av. Ing. Huergo 1435, Puerto Madero, CABA. Lunes a Viernes de 9 a 18 hs.</div>
                          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BrandingVectorIcon name="check" size={13} color="#10B981" />
                            <span>Sin costo de flete · Mercadería reservada lista para retiro con DNI/Autorización.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3 Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={() => setStep('billing')}
                      style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                    >
                      ← Volver a Facturación
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (shippingMethod !== 'hub' && (!shipping.calle || !shipping.ciudad)) {
                          setError('Por favor completá la dirección y ciudad de entrega.');
                          return;
                        }
                        setError('');
                        setStep('payment');
                      }}
                      style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px 32px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(15, 164, 222, 0.35)' }}
                    >
                      Continuar a Forma de Pago & Financiación →
                    </button>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────
                  STEP 4: FORMA DE PAGO & CONDICIONES B2B
              ───────────────────────────────────────────── */}
              {step === 'payment' && (
                <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BrandingVectorIcon name="credit-card" size={24} color="#0fa4de" />
                      <span>4. Forma de Pago & Condiciones Comerciales</span>
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                      Seleccioná las condiciones financieras para la liquidación de la orden mayorista.
                    </p>
                  </div>

                  {/* Payment Methods Cards */}
                  {(() => {
                    const activePayments = (checkoutMethods?.payment || []).filter(m => m.enabled !== false);
                    if (activePayments.length === 0) {
                      return (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BrandingVectorIcon name="alert-triangle" size={16} color="#991B1B" />
                          <span>No hay medios de pago habilitados actualmente por la administración.</span>
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                        {activePayments.map(m => {
                          const isSel = paymentMethod === m.id;
                          return (
                            <div
                              key={m.id}
                              onClick={() => setPaymentMethod(m.id)}
                              style={{
                                border: `2px solid ${isSel ? '#0fa4de' : '#E2E8F0'}`,
                                background: isSel ? '#F0F9FF' : '#FFFFFF',
                                borderRadius: '16px',
                                padding: '18px 20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: isSel ? 'rgba(15, 164, 222, 0.15)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <BrandingVectorIcon name={m.icon || 'credit-card'} size={22} color={isSel ? '#0fa4de' : '#64748B'} />
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#071524' }}>
                                      {m.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                      {m.subtitle || m.description || ''}
                                    </div>
                                  </div>
                                </div>
                                {m.badge && m.badge.toLowerCase() !== 'crédito aprobado' && m.badge.toLowerCase() !== 'credito aprobado' && (
                                  <span style={{ background: isSel ? '#0fa4de' : '#10B981', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', flexShrink: 0 }}>
                                    {m.badge}
                                  </span>
                                )}
                              </div>

                              {/* ── CUENTA CORRIENTE TERMS ── */}
                              {isSel && m.id === 'cuenta_corriente' && (
                                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #BAE6FD' }}>
                                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#0369A1' }}>
                                      {m.terms_label || 'Plazo de Facturación:'}
                                    </label>
                                    <select
                                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #0fa4de', background: '#fff', fontSize: '13px', fontWeight: '700', outline: 'none' }}
                                      value={ccTerms}
                                      onChange={e => setCcTerms(e.target.value)}
                                    >
                                      <option value="30_dias">30 días fecha de emisión de factura</option>
                                      <option value="60_dias">60 días fecha de emisión de factura</option>
                                      <option value="90_dias">90 días fecha de emisión de factura (Especial)</option>
                                    </select>
                                  </div>
                                  {m.instrucciones && (
                                    <div style={{ fontSize: '11px', color: '#0284C7', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <BrandingVectorIcon name="info" size={13} color="#0284C7" />
                                      <span>{m.instrucciones}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* ── TRANSFERENCIA BANCARIA DETAILS (CBU / SWIFT / ALIAS) ── */}
                              {isSel && m.id === 'transferencia' && (
                                <div style={{
                                  marginTop: '16px',
                                  padding: '16px',
                                  background: '#FFFFFF',
                                  borderRadius: '14px',
                                  border: '1.5px solid #BAE6FD',
                                  boxShadow: '0 2px 10px rgba(15, 164, 222, 0.08)'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #E0F2FE' }}>
                                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <BrandingVectorIcon name="building-2" size={14} color="#0369A1" />
                                      <span>Cuentas Bancarias Habilitadas para Liquidación</span>
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: '800', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '8px' }}>
                                      {m.tipo_cuenta || 'USD / ARS Oficial'}
                                    </span>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px', marginBottom: '12px' }}>
                                    <div>
                                      <span style={{ color: '#64748B', fontSize: '11px', display: 'block' }}>Banco:</span>
                                      <strong style={{ color: '#0F172A' }}>{m.banco || 'Banco Santander / BBVA'}</strong>
                                    </div>
                                    <div>
                                      <span style={{ color: '#64748B', fontSize: '11px', display: 'block' }}>Titular & Razón Social:</span>
                                      <strong style={{ color: '#0F172A' }}>{m.titular || 'DACAS S.A.'}</strong>
                                    </div>
                                    <div>
                                      <span style={{ color: '#64748B', fontSize: '11px', display: 'block' }}>CUIT / Tax ID:</span>
                                      <strong style={{ color: '#0F172A' }}>{m.cuit || '30-68942158-9'}</strong>
                                    </div>
                                  </div>

                                  {/* CBU & Alias Copy Row */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                                    {/* CBU Box */}
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>CBU / CVU</div>
                                        <code style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', letterSpacing: '0.02em' }}>
                                          {m.cbu || '0720123920000001234567'}
                                        </code>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(m.cbu || '0720123920000001234567', 'cbu');
                                        }}
                                        style={{
                                          background: copiedKey === 'cbu' ? '#10B981' : '#0fa4de',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: '8px',
                                          padding: '5px 10px',
                                          fontSize: '11px',
                                          fontWeight: '800',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          transition: 'all 0.2s'
                                        }}
                                      >
                                        <BrandingVectorIcon name={copiedKey === 'cbu' ? "check" : "file-text"} size={11} color="#ffffff" />
                                        <span>{copiedKey === 'cbu' ? 'Copiado' : 'Copiar'}</span>
                                      </button>
                                    </div>

                                    {/* Alias Box */}
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Alias CBU</div>
                                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#0369A1' }}>
                                          {m.alias || 'DACAS.PAGOS.B2B'}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(m.alias || 'DACAS.PAGOS.B2B', 'alias');
                                        }}
                                        style={{
                                          background: copiedKey === 'alias' ? '#10B981' : '#0fa4de',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: '8px',
                                          padding: '5px 10px',
                                          fontSize: '11px',
                                          fontWeight: '800',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          transition: 'all 0.2s'
                                        }}
                                      >
                                        <BrandingVectorIcon name={copiedKey === 'alias' ? "check" : "file-text"} size={11} color="#ffffff" />
                                        <span>{copiedKey === 'alias' ? 'Copiado' : 'Copiar'}</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* SWIFT Box */}
                                  {m.swift && (
                                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                      <div style={{ fontSize: '11px', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                        <BrandingVectorIcon name="globe" size={12} color="#166534" />
                                        <span><strong>Código SWIFT (Transferencias Internacionales):</strong> <code style={{ fontWeight: '800', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>{m.swift}</code></span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(m.swift, 'swift');
                                        }}
                                        style={{
                                          background: copiedKey === 'swift' ? '#10B981' : '#16A34A',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '4px 8px',
                                          fontSize: '10px',
                                          fontWeight: '800',
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                      >
                                        <BrandingVectorIcon name={copiedKey === 'swift' ? "check" : "file-text"} size={10} color="#ffffff" />
                                        <span>{copiedKey === 'swift' ? 'Copiado' : 'Copiar SWIFT'}</span>
                                      </button>
                                    </div>
                                  )}

                                  {/* Instrucciones de envío de comprobante */}
                                  {m.instrucciones && (
                                    <div style={{ fontSize: '11px', color: '#475569', background: '#F1F5F9', padding: '8px 12px', borderRadius: '8px', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <BrandingVectorIcon name="file-text" size={12} color="#475569" />
                                      <span><strong>Nota:</strong> {m.instrucciones}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* ── E-CHEQ DETAILS ── */}
                              {isSel && m.id === 'echeq' && (
                                <div style={{
                                  marginTop: '16px',
                                  padding: '16px',
                                  background: '#FFFFFF',
                                  borderRadius: '14px',
                                  border: '1.5px solid #BAE6FD',
                                  boxShadow: '0 2px 10px rgba(15, 164, 222, 0.08)'
                                }}>
                                  <div style={{ fontWeight: '800', fontSize: '13px', color: '#0369A1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <BrandingVectorIcon name="file-text" size={14} color="#0369A1" />
                                    <span>Datos para Emisión de E-Cheq</span>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                                    <div><span style={{ color: '#64748B' }}>CUIT Receptor:</span> <strong>{m.cuit_receptor || '30-68942158-9'}</strong></div>
                                    <div><span style={{ color: '#64748B' }}>Banco Receptor:</span> <strong>{m.banco_receptor || 'Banco Santander'}</strong></div>
                                    <div><span style={{ color: '#64748B' }}>Plazos Admitidos:</span> <strong>{m.plazos_admitidos || '30 y 60 días'}</strong></div>
                                  </div>
                                  {m.instrucciones && (
                                    <div style={{ fontSize: '11px', color: '#475569', background: '#F1F5F9', padding: '8px 12px', borderRadius: '8px' }}>
                                      {m.instrucciones}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* ── TARJETA STRIPE DETAILS ── */}
                              {isSel && m.id === 'tarjeta' && (
                                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #BAE6FD', fontSize: '12px', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <BrandingVectorIcon name="lock" size={13} color="#0369A1" />
                                  <span><strong>{m.gateway || 'Stripe SSL 256-bit'}:</strong> {m.instrucciones || 'Transacción encriptada y protegida bajo normativa PCI-DSS.'}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Terms & Conditions Box */}
                  <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={e => setAcceptTerms(e.target.checked)}
                        style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#0fa4de' }}
                      />
                      <span style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                        {checkoutMethods?.terms_conditions_text || 'Acepto las condiciones comerciales de DACAS B2B, términos de garantía oficial de fabricante de 12/36 meses y la emisión de la orden de compra con carácter vinculante para reserva de stock.'}
                      </span>
                    </label>
                  </div>

                  {/* Step 4 Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                    >
                      ← Volver a Logística
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '15px 36px',
                        fontWeight: '900',
                        fontSize: '15px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: '0 4px 20px rgba(15, 164, 222, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      {loading ? 'Generando Orden y Proforma...' : `Confirmar y Emitir Orden B2B • $${finalOrderTotal.toFixed(2)} USD`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Sticky Order Summary & Guarantees */}
            <div style={{ position: 'sticky', top: '90px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#071524', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrandingVectorIcon name="shopping-cart" size={18} color="#0FA4DE" />
                  <span>Resumen de la Cotización</span>
                </h3>

                {/* Items preview list */}
                <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                      <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                        <div style={{ fontWeight: '700', color: '#071524', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ color: '#94A3B8', fontSize: '11px' }}>Cant: {item.qty} × ${parseFloat(item.price).toFixed(2)}</div>
                      </div>
                      <div style={{ fontWeight: '800', color: '#071524', flexShrink: 0 }}>
                        ${(parseFloat(item.price) * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Redemption Box */}
                <div style={{ margin: '14px 0', padding: '14px', background: '#F8FAFC', borderRadius: '14px', border: '1px dashed #CBD5E1' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BrandingVectorIcon name="tag" size={13} color="#0FA4DE" />
                    <span>¿Tenés un Cupón de Descuento?</span>
                  </div>

                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Ej: FORTINET15"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12.5px',
                          fontWeight: '800',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          outline: 'none',
                          background: '#FFFFFF',
                          color: '#0F172A'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        style={{
                          background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: (couponLoading || !couponInput.trim()) ? 'not-allowed' : 'pointer',
                          opacity: (couponLoading || !couponInput.trim()) ? 0.7 : 1
                        }}
                      >
                        {couponLoading ? '...' : 'Aplicar'}
                      </button>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#DCFCE7', padding: '8px 12px', borderRadius: '8px', border: '1px solid #86EFAC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BrandingVectorIcon name="tag" size={13} color="#166534" />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '900', color: '#166534' }}>{appliedCoupon.code}</div>
                          <div style={{ fontSize: '10.5px', color: '#15803D' }}>{appliedCoupon.discount_display}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: '800', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Quitar cupón"
                      >
                        <BrandingVectorIcon name="x" size={13} color="#DC2626" />
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <div style={{ color: '#DC2626', fontSize: '11px', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BrandingVectorIcon name="alert-circle" size={12} color="#DC2626" />
                      <span>{couponError}</span>
                    </div>
                  )}
                  {couponSuccess && !couponError && (
                    <div style={{ color: '#166534', fontSize: '11px', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BrandingVectorIcon name="check-circle" size={12} color="#166534" />
                      <span>{couponSuccess}</span>
                    </div>
                  )}
                </div>

                {/* Calculations */}
                <div style={{ borderTop: '1.5px solid #F1F5F9', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>
                    <span>Subtotal de ítems:</span>
                    <span style={{ fontWeight: '700', color: '#071524' }}>${cartTotal.toFixed(2)} USD</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16A34A', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Descuento ({appliedCoupon?.code || 'Cupón'}):</span>
                      </span>
                      <span style={{ fontWeight: '800' }}>-${discountAmount.toFixed(2)} USD</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
                    <span>Envío B2B:</span>
                    <span style={{ fontWeight: '700', color: '#16A34A' }}>Bonificado (B2B)</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '900', color: '#071524', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                    <span>Total Final:</span>
                    <span style={{ color: '#0FA4DE' }}>${finalOrderTotal.toFixed(2)} USD</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>

      {/* ── Quick Login Modal ── */}
      {showLoginModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7, 21, 36, 0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '36px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900', fontSize: '1.25rem', color: '#071524' }}>
                <BrandingVectorIcon name="key" size={20} color="#0fa4de" />
                <span>Iniciar Sesión B2B</span>
              </div>
              <button onClick={() => setShowLoginModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <BrandingVectorIcon name="x" size={14} color="#64748B" />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              Accedé con tu cuenta para desbloquear tus reglas de precios personalizadas y precargar tu ficha fiscal.
            </p>

            {loginError && (
              <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', marginBottom: '14px' }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleQuickLogin}>
              <label style={labelStyle}>Email Corporativo</label>
              <input
                type="email"
                style={inputStyle}
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />

              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                style={inputStyle}
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loginLoading}
                style={{ width: '100%', background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}
              >
                {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
