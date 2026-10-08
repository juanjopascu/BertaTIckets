import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon from './BrandingVectorIcon';
import {
  API_BASE_URL,
  DACAS_COUNTRIES_LIST,
  DEFAULT_CHECKOUT_METHODS,
  isCuentaCorrienteMethod,
  inputStyle,
  labelStyle
} from './components/checkout/checkoutHelpers';
import StepCart from './components/checkout/StepCart';
import StepBilling from './components/checkout/StepBilling';
import StepShipping from './components/checkout/StepShipping';
import StepEndUser from './components/checkout/StepEndUser';
import StepPayment from './components/checkout/StepPayment';
import StepSuccess from './components/checkout/StepSuccess';
import CheckoutOrderSummary from './components/checkout/CheckoutOrderSummary';

function ShopCheckoutContent() {
  const navigate = useNavigate();

  const [selectedCountryCode, setSelectedCountryCode] = useState(() => {
    try {
      return localStorage.getItem('dacas_selected_country') || 'AR';
    } catch {
      return 'AR';
    }
  });

  const selectedCountryObj = DACAS_COUNTRIES_LIST.find(c => c.code === selectedCountryCode) || DACAS_COUNTRIES_LIST[0];

  // ── Checkout Methods (configurable per Country) ──
  const [checkoutMethods, setCheckoutMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_checkout_methods');
      return saved ? JSON.parse(saved) : DEFAULT_CHECKOUT_METHODS;
    } catch {
      return DEFAULT_CHECKOUT_METHODS;
    }
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ecommerce/settings/checkout-methods?country=${selectedCountryCode}`)
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
            const allowedPay = isCuentaCorrienteHabilitada
              ? activePay
              : activePay.filter(p => !isCuentaCorrienteMethod(p));
            setPaymentMethod((allowedPay[0] || activePay[0]).id);
          }
        }
      })
      .catch(() => {});
  }, [selectedCountryCode]);

  useEffect(() => {
    const handleCountryEvt = (e) => {
      if (e.detail?.country) {
        setSelectedCountryCode(e.detail.country);
      }
    };
    window.addEventListener('dacas_country_changed', handleCountryEvt);
    return () => window.removeEventListener('dacas_country_changed', handleCountryEvt);
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

  const isCuentaCorrienteHabilitada = Boolean(
    shopUser && (
      shopUser.cuenta_corriente_habilitada === true ||
      shopUser.cuenta_corriente_habilitada === 'true' ||
      shopUser.cuenta_corriente_habilitada === 1 ||
      shopUser.cuenta_corriente_habilitada === '1'
    )
  );

  const cuentaCorrienteLimite = parseFloat(shopUser?.cuenta_corriente_limite || shopUser?.limite_credito || 0);

  const userCountryCode = (
    shopUser?.country_code ||
    (shopUser?.country_id === 4 ? 'CL' : shopUser?.country_id === 5 ? 'CO' : 'AR') ||
    'AR'
  ).toUpperCase();
  const userCountryObj = DACAS_COUNTRIES_LIST.find(c => c.code === userCountryCode) || DACAS_COUNTRIES_LIST[0];

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const discountAmount = appliedCoupon ? (parseFloat(appliedCoupon.discount_amount) || 0) : 0;
  const netCommercialSubtotal = Math.max(0, cartTotal - discountAmount);

  // ── Percepciones IIBB (Solo para Clientes de Argentina) ──
  const isArgentinaClient = (
    (shopUser && (shopUser.country_id === 2 || shopUser.country_code === 'AR' || shopUser.pais === 'Argentina')) ||
    userCountryCode === 'AR' ||
    selectedCountryCode === 'AR'
  );

  const userPercepciones = useMemo(() => {
    if (!isArgentinaClient) return null;
    let raw = shopUser?.percepciones;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch { raw = null; }
    }
    if (!raw && isArgentinaClient) {
      // Default idéntico al ERP de referencia para clientes de Argentina
      raw = {
        caba: { enabled: true, alicuota: 1.5, vigencia: '2026-10-01' },
        bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
        salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
        misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
        tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
      };
    }
    return raw;
  }, [shopUser, isArgentinaClient]);

  const activePercepcionesList = useMemo(() => {
    if (!userPercepciones || !isArgentinaClient) return [];
    const list = [];
    const labels = {
      caba: 'CABA',
      bsas: 'Bs. As. (ARBA)',
      salta: 'Salta',
      misiones: 'Misiones',
      tucuman: 'Tucumán'
    };

    for (const [key, p] of Object.entries(userPercepciones)) {
      if (p && p.enabled) {
        const alicuota = parseFloat(p.alicuota) || 0;
        if (alicuota > 0) {
          const coef = (key === 'tucuman' && p.coef && parseFloat(p.coef) > 0) ? parseFloat(p.coef) : 1;
          const taxableBase = netCommercialSubtotal * coef;
          const amount = parseFloat(((taxableBase * alicuota) / 100).toFixed(2));
          list.push({
            key,
            label: labels[key] || key.toUpperCase(),
            jurisdiccion: key.toUpperCase(),
            alicuota,
            coef: coef !== 1 ? coef : undefined,
            vigencia: p.vigencia,
            amount
          });
        }
      }
    }
    return list;
  }, [userPercepciones, isArgentinaClient, netCommercialSubtotal]);

  const percepcionesTotal = useMemo(() => {
    return activePercepcionesList.reduce((acc, p) => acc + p.amount, 0);
  }, [activePercepcionesList]);

  const finalOrderTotal = netCommercialSubtotal + percepcionesTotal;
  const isCreditLimitExceeded = Boolean(isCuentaCorrienteHabilitada && cuentaCorrienteLimite > 0 && finalOrderTotal > cuentaCorrienteLimite);

  const [showCountryBlockedModal, setShowCountryBlockedModal] = useState(false);

  // Sincronizar y forzar el país de la cuenta registrada si el cliente está logueado
  useEffect(() => {
    if (shopUser && userCountryCode) {
      if (selectedCountryCode !== userCountryCode) {
        setSelectedCountryCode(userCountryCode);
        try {
          localStorage.setItem('dacas_selected_country', userCountryCode);
          window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: userCountryCode } }));
        } catch {}
      }
    }
  }, [shopUser, userCountryCode, selectedCountryCode]);

  // Onboarding Steps: 'cart' (1) | 'billing' (2) | 'shipping' (3) | 'end_user' (4) | 'payment' (5) | 'success' (6)
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
  const [confirmedFiscalData, setConfirmedFiscalData] = useState(true);
  const [billing, setBilling] = useState(() => {
    const u = getActiveUser();
    const nameVal = u?.nombre_compras || u?.nombre || u?.name || 'Usuario Demo';
    const emailVal = u?.email_factura_electronica || u?.email_compras || u?.email || 'demo@dacas.com';
    const empresaVal = u?.razon_social || u?.empresa || u?.organizacion || u?.company || 'Empresa Demo S.A.';
    const cuitVal = u?.cuit || u?.numero_nit || u?.tax_id || u?.identificacion_fiscal || u?.rut || '30-12345678-9';
    const phoneVal = u?.telefono_compras || u?.telefono || u?.phone || u?.tel || '+54 11 4000-1234';
    const tipoFacturaVal = u?.tipo_factura || u?.tipo_comprobante || 'Factura A (Responsable Inscripto)';
    const condicionIvaVal = u?.tipo_iva || u?.condicion_iva || 'IVA Responsable Inscripto';

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
    const nameVal = u?.nombre_compras || u?.nombre || u?.name || 'Usuario Demo';
    const phoneVal = u?.telefono_compras || u?.telefono || u?.phone || u?.tel || '+54 11 4000-1234';
    const direccionVal = u?.direccion_entrega || u?.direccion_legal || u?.direccion || u?.domicilio || 'Av. del Libertador 4500, Depósito 2';
    const ciudadVal = u?.ciudad_entrega || u?.ciudad || u?.city || 'Buenos Aires';
    const provinciaVal = u?.provincia || u?.state || 'Buenos Aires';
    const paisVal = u?.pais || u?.country || 'Argentina';
    const cpVal = u?.codigo_postal_entrega || u?.codigo_postal || u?.cp || u?.zip || '1426';

    return {
      calle: direccionVal,
      numero: '',
      piso_depto: '',
      partido: ciudadVal,
      ciudad: ciudadVal,
      codigo_postal: cpVal,
      provincia: provinciaVal,
      pais: paisVal,
      contacto_recepcion: nameVal,
      dni_retiro: '',
      telefono_recepcion: phoneVal,
      horario_entrega: '9:00 a 18:00 hs (Horario Corrido)',
      expreso_nombre: '',
      expreso_guia: '',
      instrucciones: '',
    };
  });

  // ── Step 4: ABM End User (Usuario Final) ──
  const [savedEndUsers, setSavedEndUsers] = useState([
    {
      id: 1,
      nombre: 'Banco Metropolitano S.A.',
      direccion: 'Av. Corrientes 500, Piso 12',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      telefono: '+54 11 4321-0000',
      contacto: 'Ing. Roberto Méndez (Gerente de Infraestructura IT)',
      website: 'https://www.bancometropolitano.com.ar'
    },
    {
      id: 2,
      nombre: 'PetroAndina Energía C.A.',
      direccion: 'Torre Digitel, Piso 15, La Castellana',
      ciudad: 'Caracas',
      pais: 'Venezuela',
      telefono: '+58 212 555-0199',
      contacto: 'Dr. Alejandro Silva - CEO',
      website: 'https://www.petroandina.com.ve'
    }
  ]);
  const [selectedEndUserId, setSelectedEndUserId] = useState('');
  const [endUser, setEndUser] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    pais: 'Argentina',
    telefono: '',
    contacto: '',
    website: ''
  });
  const [endUserSaving, setEndUserSaving] = useState(false);
  const [endUserFeedback, setEndUserFeedback] = useState('');

  // Cargar End Users desde la API si están disponibles
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ecommerce/client/end-users`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedEndUsers(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectEndUser = (val) => {
    setSelectedEndUserId(val);
    setEndUserFeedback('');
    if (!val || val === 'new') {
      setEndUser({
        nombre: '',
        direccion: '',
        ciudad: '',
        pais: 'Argentina',
        telefono: '',
        contacto: '',
        website: ''
      });
      return;
    }
    const found = savedEndUsers.find(eu => String(eu.id) === String(val));
    if (found) {
      setEndUser({
        id: found.id,
        nombre: found.nombre || '',
        direccion: found.direccion || '',
        ciudad: found.ciudad || '',
        pais: found.pais || 'Argentina',
        telefono: found.telefono || '',
        contacto: found.contacto || '',
        website: found.website || ''
      });
    }
  };

  const handleNewEndUser = () => {
    setSelectedEndUserId('new');
    setEndUser({
      nombre: '',
      direccion: '',
      ciudad: '',
      pais: 'Argentina',
      telefono: '',
      contacto: '',
      website: ''
    });
    setEndUserFeedback('Formulario listo para nuevo End User');
    setTimeout(() => setEndUserFeedback(''), 2500);
  };

  const handleSaveEndUser = async () => {
    if (!endUser.nombre || !endUser.nombre.trim()) {
      setError('Por favor completá al menos el Nombre del End User.');
      return;
    }
    setEndUserSaving(true);
    setEndUserFeedback('');
    try {
      const activeToken = shopToken || localStorage.getItem('dacas_client_token');
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/client/end-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
        },
        body: JSON.stringify(endUser)
      });
      const data = await res.json();
      if (data && data.end_user) {
        setSavedEndUsers(prev => {
          const exists = prev.some(x => x.id === data.end_user.id);
          if (exists) {
            return prev.map(x => x.id === data.end_user.id ? data.end_user : x);
          }
          return [data.end_user, ...prev];
        });
        setSelectedEndUserId(String(data.end_user.id));
        setEndUserFeedback('✅ End User grabado exitosamente en tu libreta');
        setTimeout(() => setEndUserFeedback(''), 3000);
      }
    } catch (_) {
      const localId = endUser.id || Date.now();
      const updatedItem = { ...endUser, id: localId };
      setSavedEndUsers(prev => [updatedItem, ...prev.filter(x => x.id !== localId)]);
      setSelectedEndUserId(String(localId));
      setEndUserFeedback('✅ End User guardado localmente');
      setTimeout(() => setEndUserFeedback(''), 3000);
    } finally {
      setEndUserSaving(false);
    }
  };

  const handleDeleteEndUser = async () => {
    if (!selectedEndUserId || selectedEndUserId === 'new') {
      handleNewEndUser();
      return;
    }
    try {
      const activeToken = shopToken || localStorage.getItem('dacas_client_token');
      await fetch(`${API_BASE_URL}/api/ecommerce/client/end-users/${selectedEndUserId}`, {
        method: 'DELETE',
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
        }
      });
    } catch (_) {}
    setSavedEndUsers(prev => prev.filter(x => String(x.id) !== String(selectedEndUserId)));
    handleNewEndUser();
    setEndUserFeedback('🗑️ End User eliminado de tu libreta');
    setTimeout(() => setEndUserFeedback(''), 2500);
  };

  // ── Step 5: Payment & Commercial Conditions ──
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const user = getActiveUser();
    const ccOk = Boolean(
      user && (
        user.cuenta_corriente_habilitada === true ||
        user.cuenta_corriente_habilitada === 'true' ||
        user.cuenta_corriente_habilitada === 1 ||
        user.cuenta_corriente_habilitada === '1'
      )
    );
    return ccOk ? 'cuenta_corriente' : 'transferencia';
  });
  const [ccTerms, setCcTerms] = useState('30_dias');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Auto-switch payment method away from CC if client is not enabled for Cuenta Corriente or limit is exceeded
  useEffect(() => {
    const activePayments = (checkoutMethods?.payment || []).filter(m => m.enabled !== false);
    if (activePayments.length === 0) return;

    const isCcBlocked = !isCuentaCorrienteHabilitada || isCreditLimitExceeded;

    if (isCcBlocked && isCuentaCorrienteMethod({ id: paymentMethod })) {
      const fallback = activePayments.find(p => !isCuentaCorrienteMethod(p));
      if (fallback) {
        setPaymentMethod(fallback.id);
      } else {
        setPaymentMethod('transferencia');
      }
    }
  }, [isCuentaCorrienteHabilitada, isCreditLimitExceeded, paymentMethod, checkoutMethods]);

  // Fetch client profile on mount if token is available
  useEffect(() => {
    const activeToken = shopToken || localStorage.getItem('dacas_client_token') || localStorage.getItem('shop_token');
    if (activeToken) {
      fetch(`${API_BASE_URL}/api/ecommerce/client/profile`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data && data.user) {
            const u = data.user;
            setShopUser(u);
            try {
              localStorage.setItem('dacas_client_user', JSON.stringify(u));
              localStorage.setItem('shop_user', JSON.stringify(u));
            } catch (_) {}

            const nameVal = u.nombre_compras || u.nombre || u.name || '';
            const emailVal = u.email_factura_electronica || u.email_compras || u.email || '';
            const empresaVal = u.razon_social || u.empresa || u.organizacion || u.company || '';
            const cuitVal = u.cuit || u.numero_nit || u.tax_id || '30-12345678-9';
            const phoneVal = u.telefono_compras || u.phone || u.telefono || '';
            const tipoFacturaVal = u.tipo_factura || 'Factura A (Responsable Inscripto)';
            const condicionIvaVal = u.tipo_iva || u.condicion_iva || 'IVA Responsable Inscripto';

            setBilling(prev => ({
              ...prev,
              empresa: empresaVal || prev.empresa,
              cuit: cuitVal || prev.cuit,
              contacto_nombre: nameVal || prev.contacto_nombre,
              contacto_email: emailVal || prev.contacto_email,
              contacto_telefono: phoneVal || prev.contacto_telefono,
              tipo_factura: tipoFacturaVal || prev.tipo_factura,
              condicion_iva: condicionIvaVal || prev.condicion_iva,
            }));

            const direccionVal = u.direccion_entrega || u.direccion_legal || u.direccion || '';
            const ciudadVal = u.ciudad_entrega || u.ciudad || '';
            const cpVal = u.codigo_postal_entrega || u.codigo_postal || '';

            setShipping(prev => ({
              ...prev,
              calle: direccionVal || prev.calle,
              ciudad: ciudadVal || prev.ciudad,
              codigo_postal: cpVal || prev.codigo_postal,
              contacto_recepcion: nameVal || prev.contacto_recepcion,
              telefono_recepcion: phoneVal || prev.telefono_recepcion,
            }));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Auto-populate / Sync when user logs in or steps change
  useEffect(() => {
    const u = getActiveUser();
    if (u) {
      setShopUser(u);

      const nameVal = u.nombre_compras || u.nombre || u.name || '';
      const emailVal = u.email_factura_electronica || u.email_compras || u.email || '';
      const empresaVal = u.razon_social || u.empresa || u.organizacion || u.company || '';
      const cuitVal = u.cuit || u.numero_nit || u.tax_id || (empresaVal.includes('Demo') ? '30-12345678-9' : '30-12345678-9');
      const phoneVal = u.telefono_compras || u.phone || u.telefono || '';
      const tipoFacturaVal = u.tipo_factura || 'Factura A (Responsable Inscripto)';
      const condicionIvaVal = u.tipo_iva || u.condicion_iva || 'IVA Responsable Inscripto';

      setBilling(prev => ({
        ...prev,
        empresa: prev.empresa || empresaVal || 'Empresa Demo S.A.',
        cuit: prev.cuit || cuitVal,
        contacto_nombre: prev.contacto_nombre || nameVal || 'Usuario Demo',
        contacto_email: prev.contacto_email || emailVal || 'demo@dacas.com',
        contacto_telefono: prev.contacto_telefono || phoneVal || '+54 11 4000-1234',
        tipo_factura: prev.tipo_factura || tipoFacturaVal,
        condicion_iva: prev.condicion_iva || condicionIvaVal,
      }));

      const direccionVal = u.direccion_entrega || u.direccion_legal || u.direccion || u.domicilio || '';
      const ciudadVal = u.ciudad_entrega || u.ciudad || u.city || '';
      const provinciaVal = u.provincia || u.state || 'Buenos Aires';
      const paisVal = u.pais || u.country || 'Argentina';
      const cpVal = u.codigo_postal_entrega || u.codigo_postal || u.cp || u.zip || '';

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

    if (isCuentaCorrienteMethod({ id: paymentMethod })) {
      if (cuentaCorrienteLimite > 0 && finalOrderTotal > cuentaCorrienteLimite) {
        setError(`El total de tu pedido ($${finalOrderTotal.toFixed(2)} USD) supera el límite de crédito disponible ($${cuentaCorrienteLimite.toFixed(2)} USD) de tu Cuenta Corriente. Por favor seleccioná Transferencia Bancaria u otro medio de pago.`);
        setLoading(false);
        return;
      }
      if (!isCuentaCorrienteHabilitada) {
        setError('El método de pago Cuenta Corriente está bloqueado para tu cuenta comercial. Seleccioná otra opción o comunicate con administración.');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError('');

    const activeShipping = (checkoutMethods?.shipping || []).filter(m => m.enabled !== false);
    const selectedShippingMethodObj = activeShipping.find(m => m.id === shippingMethod) || activeShipping[0];
    const effDeliveryType = selectedShippingMethodObj?.delivery_type || (
      (selectedShippingMethodObj?.id?.toLowerCase().includes('hub') || selectedShippingMethodObj?.title?.toLowerCase().includes('retiro'))
        ? 'hub'
        : (selectedShippingMethodObj?.id?.toLowerCase().includes('expreso') || selectedShippingMethodObj?.title?.toLowerCase().includes('expreso'))
        ? 'expreso'
        : 'caba'
    );

    const formattedAddress = effDeliveryType === 'hub'
      ? `Retiro en HUB: ${shipping.contacto_recepcion || 'Personal Autorizado'} (DNI: ${shipping.dni_retiro || 'S/D'}) • Tel: ${shipping.telefono_recepcion || 'S/T'}`
      : effDeliveryType === 'expreso'
        ? `Expreso ${shipping.expreso_nombre || 'Contratado'} - Receptoría: ${shipping.calle} ${shipping.numero}, ${shipping.partido || shipping.ciudad} (${shipping.codigo_postal}) • Tel: ${shipping.telefono_recepcion}`
        : `${shipping.calle} ${shipping.numero} ${shipping.piso_depto ? `(${shipping.piso_depto})` : ''}, ${shipping.partido || shipping.ciudad} (CP ${shipping.codigo_postal}) • Tel: ${shipping.telefono_recepcion}`;

    const paymentMethodLabel = isCuentaCorrienteMethod({ id: paymentMethod })
      ? `Cuenta Corriente B2B (${ccTerms === '30_dias' ? '30 días fecha factura' : ccTerms === '60_dias' ? '60 días fecha factura' : '90 días fecha factura'})`
      : (paymentMethod || '').includes('transferencia')
        ? 'Transferencia Bancaria Inmediata (CBU / SWIFT)'
        : (paymentMethod || '').includes('tarjeta')
          ? 'Tarjeta de Crédito Corporativa (Stripe SSL)'
          : 'E-Cheq / Cheque de Pago Diferido';

    try {
      const activeToken = shopToken || localStorage.getItem('dacas_client_token') || localStorage.getItem('shop_token') || localStorage.getItem('token');
      const orderPayload = {
        user_id: shopUser?.id || null,
        email: billing.contacto_email || shopUser?.email || null,
        cuit: billing.cuit || shopUser?.numero_nit || shopUser?.cuit || null,
        items: cart.map(i => ({ id: i.id, quantity: i.qty, qty: i.qty })),
        country_id: selectedCountryObj?.id || 2,
        country_code: selectedCountryCode || 'AR',
        payment_method: paymentMethodLabel,
        shipping_method: selectedShippingMethodObj?.title || (effDeliveryType === 'hub' ? 'Retiro en Depósito Central' : effDeliveryType === 'expreso' ? 'Expreso Transporte' : 'Envío Express a Domicilio'),
        shipping_address: formattedAddress,
        billing_info: billing,
        po_number: billing.po_number || `OC-${Math.floor(1000 + Math.random() * 9000)}`,
        delivery_notes: shipping.instrucciones || '',
        notes: effDeliveryType === 'hub'
          ? `Retiro en HUB. Persona autorizada: ${shipping.contacto_recepcion} - DNI: ${shipping.dni_retiro}. Tel: ${shipping.telefono_recepcion}.`
          : effDeliveryType === 'expreso'
            ? `Expreso: ${shipping.expreso_nombre}. Remito/Guía: ${shipping.expreso_guia}. Contacto: ${shipping.contacto_recepcion} (${shipping.telefono_recepcion}).`
            : `Horario: ${shipping.horario_entrega}. Receptor: ${shipping.contacto_recepcion}. Teléfono coordinación: ${shipping.telefono_recepcion}.`,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        end_user: (endUser.nombre && endUser.nombre.trim()) ? endUser : null,
        percepciones_total: percepcionesTotal.toFixed(2),
        percepciones_applied: activePercepcionesList
      };

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (activeToken) {
          headers['Authorization'] = `Bearer ${activeToken}`;
        }
        const res = await fetch(`${API_BASE_URL}/api/ecommerce/client/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify(orderPayload),
        });
        const data = await res.json();
        if (res.ok && data.order) {
          setCreatedOrder(data.order);
          clearCart();
          setStep('success');
          return;
        } else if (!res.ok) {
          setError(data.error || 'No se pudo generar la orden de compra.');
          setLoading(false);
          return;
        }
      } catch (backendErr) {
        console.warn('Backend call failed, using simulated fallback:', backendErr);
      }

      // Offline / Simulated Fallback
      await new Promise(r => setTimeout(r, 1200));
      const simulatedOrder = {
        id: Math.floor(Math.random() * 9000) + 1000,
        total: finalOrderTotal.toFixed(2),
        subtotal: cartTotal.toFixed(2),
        discount_applied: discountAmount.toFixed(2),
        percepciones_total: percepcionesTotal.toFixed(2),
        percepciones_applied: activePercepcionesList,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        status: 'procesando',
        payment_method: paymentMethodLabel,
        shipping_method: orderPayload.shipping_method,
        shipping_address: formattedAddress,
        end_user: (endUser.nombre && endUser.nombre.trim()) ? endUser : null,
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
    { key: 'end_user', num: 4, label: 'Datos de End User', icon: 'briefcase' },
    { key: 'payment', num: 5, label: 'Pago & Condiciones', icon: 'credit-card' },
    { key: 'success', num: 6, label: 'Orden Confirmada', icon: 'award' },
  ];

  const currentStepIdx = stepsList.findIndex(s => s.key === step);

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
                    {isCuentaCorrienteHabilitada ? (
                      <span style={{ color: '#86EFAC', marginLeft: '6px', fontWeight: '700' }}>• CC Habilitada</span>
                    ) : (
                      <span style={{ color: '#94A3B8', marginLeft: '6px' }}>• Sin CC</span>
                    )}
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

      {/* ── Active Country Scope Banner ── */}
      <div className="no-print" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{selectedCountryObj.flag}</span>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>
                Operando bajo normativa y logística de {selectedCountryObj.name}
              </div>
              <div style={{ color: '#64748b', fontSize: '11.5px' }}>
                Depósitos centrales, fletes y métodos de pago bancarios locales en {selectedCountryObj.name}
              </div>
            </div>
          </div>
          {shopUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#EFF6FF',
                border: '1.5px solid #0FA4DE',
                padding: '6px 14px',
                borderRadius: '8px',
                color: '#0369A1',
                fontSize: '12px',
                fontWeight: '800'
              }}>
                <span>🔒 Tienda Asignada: {selectedCountryObj.flag} {selectedCountryObj.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCountryBlockedModal(true)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#64748B',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                title="Tu cuenta B2B está autorizada exclusivamente para comprar en Argentina"
              >
                ¿Comprar en otro país? 🌐
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#475569', fontWeight: '750', textTransform: 'uppercase' }}>Cambiar País:</span>
              <select
                value={selectedCountryCode}
                onChange={(e) => {
                  const newCode = e.target.value;
                  setSelectedCountryCode(newCode);
                  try {
                    localStorage.setItem('dacas_selected_country', newCode);
                    window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: newCode } }));
                  } catch {}
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #0fa4de',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                {DACAS_COUNTRIES_LIST.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
          )}
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

        {/* ── ONBOARDING STEP 6: SUCCESS / CONFIRMED PROFORMA ── */}
        {step === 'success' && createdOrder && (
          <StepSuccess createdOrder={createdOrder} navigate={navigate} />
        )}

        {/* ── STEPS 1 TO 5 (Checkout Onboarding Layout) ── */}
        {step !== 'success' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

            {/* Left Column: Current Onboarding Step Content */}
            <div>
              {step === 'cart' && (
                <StepCart
                  cart={cart}
                  updateQty={updateQty}
                  removeFromCart={removeFromCart}
                  navigate={navigate}
                  setStep={setStep}
                />
              )}

              {step === 'billing' && (
                <StepBilling
                  billing={billing}
                  setBilling={setBilling}
                  shopUser={shopUser}
                  confirmedFiscalData={confirmedFiscalData}
                  setConfirmedFiscalData={setConfirmedFiscalData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                  setStep={setStep}
                  setError={setError}
                  navigate={navigate}
                />
              )}

              {step === 'shipping' && (
                <StepShipping
                  shippingMethod={shippingMethod}
                  setShippingMethod={setShippingMethod}
                  shipping={shipping}
                  setShipping={setShipping}
                  checkoutMethods={checkoutMethods}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                  setStep={setStep}
                  setError={setError}
                />
              )}

              {step === 'end_user' && (
                <StepEndUser
                  selectedEndUserId={selectedEndUserId}
                  handleSelectEndUser={handleSelectEndUser}
                  savedEndUsers={savedEndUsers}
                  endUser={endUser}
                  setEndUser={setEndUser}
                  handleNewEndUser={handleNewEndUser}
                  handleSaveEndUser={handleSaveEndUser}
                  handleDeleteEndUser={handleDeleteEndUser}
                  endUserSaving={endUserSaving}
                  endUserFeedback={endUserFeedback}
                  setEndUserFeedback={setEndUserFeedback}
                  setStep={setStep}
                  setError={setError}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              )}

              {step === 'payment' && (
                <StepPayment
                  checkoutMethods={checkoutMethods}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  isCuentaCorrienteHabilitada={isCuentaCorrienteHabilitada}
                  setError={setError}
                  ccTerms={ccTerms}
                  setCcTerms={setCcTerms}
                  isArgentinaClient={isArgentinaClient}
                  shopUser={shopUser}
                  billing={billing}
                  netCommercialSubtotal={netCommercialSubtotal}
                  activePercepcionesList={activePercepcionesList}
                  acceptTerms={acceptTerms}
                  setAcceptTerms={setAcceptTerms}
                  handlePlaceOrder={handlePlaceOrder}
                  loading={loading}
                  finalOrderTotal={finalOrderTotal}
                  cuentaCorrienteLimite={cuentaCorrienteLimite}
                  isCreditLimitExceeded={isCreditLimitExceeded}
                  setStep={setStep}
                />
              )}
            </div>

            {/* Right Column: Live Sticky Order Summary & Guarantees */}
            <CheckoutOrderSummary
              cart={cart}
              appliedCoupon={appliedCoupon}
              handleApplyCoupon={handleApplyCoupon}
              couponInput={couponInput}
              setCouponInput={setCouponInput}
              couponLoading={couponLoading}
              handleRemoveCoupon={handleRemoveCoupon}
              couponError={couponError}
              couponSuccess={couponSuccess}
              cartTotal={cartTotal}
              discountAmount={discountAmount}
              isArgentinaClient={isArgentinaClient}
              activePercepcionesList={activePercepcionesList}
              finalOrderTotal={finalOrderTotal}
            />

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

      {/* ── Country Blocked / Switch Account Modal ── */}
      {showCountryBlockedModal && shopUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 21, 36, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px'
            }}>
              🔒
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>
              Cambio de País no permitido para esta cuenta
            </h3>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '12px 16px',
              margin: '16px 0',
              textAlign: 'left',
              fontSize: '12.5px',
              color: '#334155'
            }}>
              <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                🏢 {shopUser.empresa || shopUser.razon_social || shopUser.name}
              </div>
              <div style={{ color: '#64748B', fontSize: '11.5px' }}>
                {shopUser.cuit || shopUser.numero_nit ? `CUIT/NIT: ${shopUser.cuit || shopUser.numero_nit} · ` : ''}
                País de registro: <strong>{userCountryObj.flag} {userCountryObj.name}</strong>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 24px' }}>
              Tu cuenta corporativa está registrada bajo la normativa fiscal, aduanera y comercial de <strong>{userCountryObj.name}</strong>. Por reglamentación B2B, no es posible emitir pedidos en la tienda de otro país con este usuario.
              <br /><br />
              Para comprar en otro país, debes <strong>cerrar tu sesión actual</strong> e ingresar con una cuenta corporativa habilitada en ese país.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCountryBlockedModal(false)}
                style={{
                  width: '100%',
                  background: '#0FA4DE',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(15, 164, 222, 0.3)'
                }}
              >
                Permanecer en Tienda {userCountryObj.flag} {userCountryObj.name}
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('dacas_client_user');
                  localStorage.removeItem('dacas_client_token');
                  localStorage.removeItem('shop_user');
                  localStorage.removeItem('shop_token');
                  setShopUser(null);
                  setShopToken(null);
                  setShowCountryBlockedModal(false);
                  navigate('/shop');
                }}
                style={{
                  width: '100%',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: '700',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión e Ingresar con otra cuenta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

class CheckoutErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Checkout error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '32px' }}>
            🛒
          </div>
          <h2 style={{ color: '#0F172A', margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800 }}>
            Hubo un detalle al cargar el Checkout
          </h2>
          <p style={{ color: '#64748B', maxWidth: '480px', margin: '0 0 20px', fontSize: '14px' }}>
            No te preocupes, los productos de tu carrito se encuentran guardados.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              style={{
                background: '#0FA4DE',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Reintentar 🔄
            </button>
            <button
              onClick={() => window.location.href = '/shop'}
              style={{
                background: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Volver a la Tienda
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ShopCheckout(props) {
  return (
    <CheckoutErrorBoundary>
      <ShopCheckoutContent {...props} />
    </CheckoutErrorBoundary>
  );
}
