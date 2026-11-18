import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, PackagePlus, Package, ScanBarcode, Wallet, Users, Truck,
  BarChart3, Search, Settings, Plus, Minus, Trash2, CheckCircle2, XCircle,
  Printer, Share2, Camera, FileText, Sparkles, AlertTriangle, RefreshCw,
  Mic, PauseCircle, RotateCcw, Download, Upload, ArrowRight, Edit3,
  Check, DollarSign, Calendar, Clock, Tag, ShieldCheck, ChevronLeft, Volume2
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

// دالة إصدار صوت بيب للكاشير عند مسح الباركود
const playBeep = (freq = 1100, duration = 0.09) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

// البيانات الافتراضية الأولية للمحل عند التشغيل لأول مرة
const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'جهينة عصير مانجو 1 لتر',
    barcode: '6221011000011',
    extraBarcodes: '62210111',
    category: 'مشروبات وعصائر',
    costPrice: 28,
    sellPrice: 35,
    stock: 24,
    minStock: 6,
    unit: 'عبوة',
    supplier: 'شركة جهينة للتوزيع',
    expiryDate: '2027-06-15',
    offerQty: 2,
    offerPrice: 65,
    isFavorite: true,
    lastBuyDate: '2026-11-10',
    lastSellDate: '2026-11-18'
  },
  {
    id: 'p2',
    name: 'أرز الساعة مصري فاخر 1 كجم',
    barcode: '6223001000022',
    extraBarcodes: '',
    category: 'بقوليات وحبوب',
    costPrice: 29,
    sellPrice: 34,
    stock: 45,
    minStock: 10,
    unit: 'كيلو',
    supplier: 'تجار جملة المواد الغذائية',
    expiryDate: '2027-12-01',
    offerQty: 0,
    offerPrice: 0,
    isFavorite: true,
    lastBuyDate: '2026-11-12',
    lastSellDate: '2026-11-18'
  },
  {
    id: 'p3',
    name: 'سكر الأسرة أبيض 1 كجم',
    barcode: '6223001000033',
    extraBarcodes: '',
    category: 'بقوليات وحبوب',
    costPrice: 30,
    sellPrice: 35,
    stock: 5,
    minStock: 12,
    unit: 'كيلو',
    supplier: 'تجار جملة المواد الغذائية',
    expiryDate: '2028-01-01',
    offerQty: 0,
    offerPrice: 0,
    isFavorite: true,
    lastBuyDate: '2026-11-05',
    lastSellDate: '2026-11-18'
  },
  {
    id: 'p4',
    name: 'جبنة رومي بطارخ قديمة (بالوزن)',
    barcode: '1001',
    extraBarcodes: '',
    category: 'ألبان وأجبان',
    costPrice: 210,
    sellPrice: 260,
    stock: 8.5,
    minStock: 2,
    unit: 'كيلو',
    supplier: 'مزارع الألبان المتحدة',
    expiryDate: '2027-02-20',
    offerQty: 0,
    offerPrice: 0,
    isFavorite: true,
    lastBuyDate: '2026-11-14',
    lastSellDate: '2026-11-18'
  },
  {
    id: 'p5',
    name: 'شيبسي عائلي طماطم',
    barcode: '6224000000055',
    extraBarcodes: '',
    category: 'سناكس وحلويات',
    costPrice: 12.5,
    sellPrice: 15,
    stock: 30,
    minStock: 10,
    unit: 'قطعة',
    supplier: 'مندوب شيبسي',
    expiryDate: '2027-03-10',
    offerQty: 3,
    offerPrice: 42,
    isFavorite: true,
    lastBuyDate: '2026-11-15',
    lastSellDate: '2026-11-18'
  }
];

const DEFAULT_CUSTOMERS = [
  { id: 'c1', name: 'الحاج محمود عبد السلام', phone: '01012345678', balance: 185, transactions: [] },
  { id: 'c2', name: 'أستاذ أحمد جار المحل', phone: '01298765432', balance: 0, transactions: [] }
];

const DEFAULT_SUPPLIERS = [
  { id: 's1', name: 'شركة جهينة للتوزيع', phone: '01000111222', products: 'عصائر وألبان', balance: 850, lastBuyDate: '2026-11-10', transactions: [] },
  { id: 's2', name: 'تجار جملة المواد الغذائية', phone: '01112223334', products: 'أرز وسكر وزيت ومكرونة', balance: 0, lastBuyDate: '2026-11-12', transactions: [] }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState(null);

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('gpos_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('gpos_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem('gpos_purchases');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('gpos_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('gpos_customers');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
  });
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('gpos_suppliers');
    return saved ? JSON.parse(saved) : DEFAULT_SUPPLIERS;
  });
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('gpos_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gpos_settings');
    return saved ? JSON.parse(saved) : {
      storeName: 'سوبر ماركت الطلخاوي',
      storePhone: '01000000000',
      storeAddress: 'الإسكندرية - مصر',
      openingCash: 500,
      geminiApiKey: ''
    };
  });

  useEffect(() => { localStorage.setItem('gpos_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('gpos_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('gpos_purchases', JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem('gpos_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('gpos_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('gpos_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('gpos_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('gpos_settings', JSON.stringify(settings)); }, [settings]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addLog = (action, details) => {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ar-EG'),
      action,
      details
    };
    setAuditLogs(prev => [entry, ...prev.slice(0, 199)]);
  };

  const [cart, setCart] = useState([]);
  const [heldCarts, setHeldCarts] = useState([]);
  const [posSearch, setPosSearch] = useState('');
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('نقدي');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [scannerTarget, setScannerTarget] = useState('pos');
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode = null;
    if (showCameraScanner) {
      setTimeout(() => {
        html5QrCode = new Html5Qrcode("reader-container");
        scannerRef.current = html5QrCode;
        html5QrCode.start(
          { facingMode: "environment" },
          { fps: 12, qrbox: { width: 250, height: 140 } },
          (decodedText) => {
            playBeep(1200, 0.1);
            handleBarcodeDetected(decodedText);
          },
          () => {}
        ).catch(() => {
          showToast('تعذر فتح الكاميرا، تأكد من إعطاء صلاحية الكاميرا للتطبيق', 'error');
          setShowCameraScanner(false);
        });
      }, 250);
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [showCameraScanner]);

  const handleBarcodeDetected = (code) => {
    const cleanCode = code.trim();
    const found = products.find(
      p => p.barcode === cleanCode || (p.extraBarcodes && p.extraBarcodes.split(',').map(s => s.trim()).includes(cleanCode))
    );

    if (scannerTarget === 'pos') {
      if (found) {
        addToCart(found, 1);
        showToast(`تمت إضافة: ${found.name}`);
      } else {
        showToast(`باركود غير مسجل (${cleanCode}) - يمكنك إضافته سريعاً`, 'error');
      }
    } else if (scannerTarget === 'purchase') {
      setShowCameraScanner(false);
      if (found) {
        setPurchaseForm({
          ...purchaseForm,
          productId: found.id,
          name: found.name,
          barcode: found.barcode,
          category: found.category,
          costPrice: found.costPrice,
          sellPrice: found.sellPrice,
          unit: found.unit
        });
        showToast(`تم التعرف على المنتج: ${found.name}`);
      } else {
        setPurchaseForm({
          ...purchaseForm,
          productId: '',
          barcode: cleanCode,
          name: ''
        });
        showToast(`باركود جديد (${cleanCode})، أدخل اسم المنتج أو صوره بالذكاء الاصطناعي`);
      }
    } else if (scannerTarget === 'lookup') {
      setShowCameraScanner(false);
      setPosSearch(cleanCode);
      setActiveTab('inventory');
    }
  };

  const calculateItemTotal = (item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.sellPrice) || 0;
    const itemDisc = Number(item.itemDiscount) || 0;
    if (item.offerQty > 0 && item.offerPrice > 0 && qty >= item.offerQty) {
      const bundles = Math.floor(qty / item.offerQty);
      const remainder = qty % item.offerQty;
      return Math.max(0, bundles * item.offerPrice + remainder * price - itemDisc);
    }
    return Math.max(0, qty * price - itemDisc);
  };

  const addToCart = (product, addQty = 1) => {
    playBeep(1050, 0.07);
    if (product.sellPrice < product.costPrice) {
      showToast(`تنبيه: سعر بيع (${product.name}) أقل من سعر الشراء!`, 'error');
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: Number((i.qty + addQty).toFixed(3)) } : i
        );
      }
      return [...prev, { ...product, qty: addQty, itemDiscount: 0 }];
    });
  };

  const updateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
      return;
    }
    setCart(prev => prev.map(i => (i.id === id ? { ...i, qty: Number(newQty) } : i)));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const cartFinalTotal = Math.max(0, cartSubtotal - (Number(invoiceDiscount) || 0));
  const changeDue = paidAmount ? Math.max(0, Number(paidAmount) - cartFinalTotal) : 0;

  const startVoiceSearch = (onResultCallback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('البحث الصوتي غير مدعوم على هذا المتصفح', 'error');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.start();
    showToast('تحدث الآن باسم المنتج...');
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResultCallback(transcript);
    };
  };

  const completeSale = () => {
    if (cart.length === 0) {
      showToast('السلة فارغة!', 'error');
      return;
    }
    if (paymentMethod === 'آجل' && !selectedCustomerId) {
      showToast('يرجى اختيار العميل لتسجيل الفاتورة الآجلة', 'error');
      return;
    }

    const totalCost = cart.reduce((sum, i) => sum + (Number(i.costPrice) || 0) * i.qty, 0);
    const profit = cartFinalTotal - totalCost;
    const todayStr = new Date().toISOString().slice(0, 10);

    const newSale = {
      id: 'INV-' + Date.now().toString().slice(-6),
      date: todayStr,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      items: cart,
      subtotal: cartSubtotal,
      discount: Number(invoiceDiscount) || 0,
      total: cartFinalTotal,
      paid: paymentMethod === 'آجل' ? (Number(paidAmount) || 0) : cartFinalTotal,
      paymentMethod,
      customerId: selectedCustomerId || null,
      profit
    };

    setProducts(prev =>
      prev.map(p => {
        const soldItem = cart.find(c => c.id === p.id);
        if (!soldItem) return p;
        return {
          ...p,
          stock: Number((p.stock - soldItem.qty).toFixed(3)),
          lastSellDate: todayStr
        };
      })
    );

    if (paymentMethod === 'آجل' && selectedCustomerId) {
      const unpaid = cartFinalTotal - (Number(paidAmount) || 0);
      setCustomers(prev =>
        prev.map(c => {
          if (c.id !== selectedCustomerId) return c;
          return {
            ...c,
            balance: c.balance + unpaid,
            transactions: [
              {
                id: Date.now().toString(),
                date: todayStr,
                type: 'فاتورة مشتريات آجلة',
                amount: unpaid,
                invoiceId: newSale.id
              },
              ...(c.transactions || [])
            ]
          };
        })
      );
    }

    setSales(prev => [newSale, ...prev]);
    setLastReceipt(newSale);
    setCart([]);
    setInvoiceDiscount(0);
    setPaidAmount('');
    setPaymentMethod('نقدي');
    setSelectedCustomerId('');
    playBeep(1400, 0.15);
    showToast(`تم حفظ الفاتورة ${newSale.id} بنجاح`);
  };

  const shareReceiptWhatsApp = (receipt) => {
    const itemsList = receipt.items
      .map(i => `• ${i.name} (${i.qty} ${i.unit}) = ${calculateItemTotal(i).toFixed(2)} ج`)
      .join('\n');
    const text = `*${settings.storeName}*\nفاتورة رقم: ${receipt.id}\nالتاريخ: ${receipt.date} - ${receipt.time}\n----------------\n${itemsList}\n----------------\n*الإجمالي النهائي: ${receipt.total.toFixed(2)} ج.م*\nطريقة الدفع: ${receipt.paymentMethod}\nشكراً لزيارتكم!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    name: '',
    barcode: '',
    category: 'عام',
    costPrice: '',
    sellPrice: '',
    qty: '',
    unit: 'قطعة',
    supplierName: '',
    expiryDate: '',
    marginPercent: 20
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [extractedInvoiceItems, setExtractedInvoiceItems] = useState([]);
  const [invoiceSupplier, setInvoiceSupplier] = useState('');

  // ضغط وتصغير الصورة قبل الإرسال لتسريع الذكاء الاصطناعي وتفادي أخطاء الحجم
  const compressImageToBase64 = (file, maxWidth = 1024, quality = 0.78) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl.split(',')[1]);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImageWithGemini = async (file, mode) => {
    if (!file) return;
    setAiLoading(true);

    try {
      const base64Data = await compressImageToBase64(file, 1024, 0.78);

      if (!settings.geminiApiKey || !settings.geminiApiKey.trim()) {
        setTimeout(() => {
          if (mode === 'product') {
            setPurchaseForm(prev => ({
              ...prev,
              name: 'لبن المراعي كامل الدسم 1 لتر',
              category: 'ألبان وأجبان',
              unit: 'عبوة',
              costPrice: 36,
              sellPrice: 42,
              qty: 12
            }));
            showToast('تم إدخال بيانات تجريبية — أضف مفتاح Gemini API من الإعدادات للقراءة الحقيقية');
          } else {
            setInvoiceSupplier('شركة التوزيع والمواد الغذائية');
            setExtractedInvoiceItems([
              { name: 'زيت عافية ذرة 800 مل', qty: 12, costPrice: 75, sellPrice: 85, unit: 'عبوة' },
              { name: 'مكرونة الملكة 400 جم', qty: 20, costPrice: 11, sellPrice: 14, unit: 'كيس' },
              { name: 'شاي العروسة 250 جم', qty: 15, costPrice: 48, sellPrice: 55, unit: 'عبوة' }
            ]);
            showToast('تم عرض فاتورة تجريبية — أضف مفتاح Gemini API من الإعدادات للقراءة الحقيقية');
          }
          setAiLoading(false);
        }, 900);
        return;
      }

      const prompt =
        mode === 'product'
          ? 'حلل صورة عبوة المنتج واستخرج البيانات بدقة باللغة العربية في كائن JSON بالمفاتيح التالية فقط: {"name": "اسم المنتج والعلامة التجارية والوزن أو الحجم", "category": "التصنيف", "unit": "قطعة أو عبوة أو كيلو أو لتر أو كرتونة"}'
          : 'حلل صورة فاتورة المورد واستخرج الأصناف في كائن JSON بالمفاتيح التالية فقط: {"supplier": "اسم المورد إن وجد", "items": [{"name": "اسم الصنف", "qty": 1, "costPrice": 0, "sellPrice": 0, "unit": "قطعة"}]}';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1
            },
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: base64Data
                    }
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        const apiMsg = data?.error?.message || `خطأ في الاتصال (${response.status})`;
        showToast(`خطأ Gemini: ${apiMsg}`, 'error');
        return;
      }

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanedText = rawText.replace(/```json|```/gi, '').trim();
      const parsed = JSON.parse(cleanedText);

      if (mode === 'product') {
        if (!parsed.name) {
          showToast('لم يظهر اسم واضح على العبوة، قرّب الكاميرا من اسم المنتج', 'error');
          return;
        }
        setPurchaseForm(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          category: parsed.category || prev.category,
          unit: parsed.unit || prev.unit
        }));
        showToast('تم استخراج بيانات العبوة بنجاح!');
      } else if (mode === 'invoice') {
        const items = Array.isArray(parsed.items) ? parsed.items : [];
        if (items.length === 0) {
          showToast('لم يتم استخراج أصناف من الفاتورة، حاول تصويرها بشكل مستقيم', 'error');
          return;
        }
        setInvoiceSupplier(parsed.supplier || 'مورد عام');
        setExtractedInvoiceItems(items);
        showToast(`تم استخراج ${items.length} أصناف للمراجعة`);
      }
    } catch (err) {
      showToast('تعذر تحليل الصورة، تأكد من وجود إنترنت ومفتاح API صحيح', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSavePurchase = (e) => {
    e.preventDefault();
    if (!purchaseForm.name || !purchaseForm.qty || !purchaseForm.costPrice) {
      showToast('يرجى إدخال اسم المنتج والكمية وسعر الشراء', 'error');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const qtyNum = Number(purchaseForm.qty);
    const costNum = Number(purchaseForm.costPrice);
    const sellNum = Number(purchaseForm.sellPrice) || Math.ceil(costNum * 1.2);

    const existing = products.find(
      p => (purchaseForm.productId && p.id === purchaseForm.productId) ||
           (purchaseForm.barcode && p.barcode === purchaseForm.barcode) ||
           p.name.trim() === purchaseForm.name.trim()
    );

    if (existing) {
      setProducts(prev =>
        prev.map(p =>
          p.id === existing.id
            ? {
                ...p,
                stock: Number((p.stock + qtyNum).toFixed(3)),
                prevCostPrice: p.costPrice,
                costPrice: costNum,
                sellPrice: sellNum,
                expiryDate: purchaseForm.expiryDate || p.expiryDate,
                lastBuyDate: todayStr
              }
            : p
        )
      );
      addLog('توريد مخزون', `إضافة كمية (${qtyNum}) للمنتج: ${existing.name} بسعر شراء ${costNum} ج`);
    } else {
      const newProd = {
        id: 'p_' + Date.now(),
        name: purchaseForm.name,
        barcode: purchaseForm.barcode || String(Math.floor(100000 + Math.random() * 900000)),
        extraBarcodes: '',
        category: purchaseForm.category || 'عام',
        costPrice: costNum,
        sellPrice: sellNum,
        stock: qtyNum,
        minStock: 5,
        unit: purchaseForm.unit || 'قطعة',
        supplier: purchaseForm.supplierName || 'مورد عام',
        expiryDate: purchaseForm.expiryDate || '',
        offerQty: 0,
        offerPrice: 0,
        isFavorite: true,
        lastBuyDate: todayStr,
        lastSellDate: ''
      };
      setProducts(prev => [newProd, ...prev]);
      addLog('منتج جديد', `إنشاء وتوريد منتج جديد: ${newProd.name}`);
    }

    const newPurchaseRecord = {
      id: 'PUR-' + Date.now().toString().slice(-5),
      date: todayStr,
      supplier: purchaseForm.supplierName || 'مورد نقدي',
      productName: purchaseForm.name,
      qty: qtyNum,
      costPrice: costNum,
      total: qtyNum * costNum
    };

    setPurchases(prev => [newPurchaseRecord, ...prev]);
    setPurchaseForm({
      productId: '', name: '', barcode: '', category: 'عام',
      costPrice: '', sellPrice: '', qty: '', unit: 'قطعة',
      supplierName: '', expiryDate: '', marginPercent: 20
    });
    showToast('تم تسجيل الواردات وتحديث المخزون بنجاح');
  };

  const approveExtractedInvoice = () => {
    if (extractedInvoiceItems.length === 0) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    let updatedProducts = [...products];
    const newPurchasesList = [];

    extractedInvoiceItems.forEach((item, idx) => {
      const qty = Number(item.qty) || 1;
      const cost = Number(item.costPrice) || 10;
      const sell = Number(item.sellPrice) || Math.ceil(cost * 1.2);
      const existingIndex = updatedProducts.findIndex(p => p.name.trim() === item.name.trim());

      if (existingIndex > -1) {
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          stock: Number((updatedProducts[existingIndex].stock + qty).toFixed(3)),
          costPrice: cost,
          sellPrice: sell,
          lastBuyDate: todayStr
        };
      } else {
        updatedProducts.unshift({
          id: 'p_ai_' + Date.now() + '_' + idx,
          name: item.name,
          barcode: String(Math.floor(100000 + Math.random() * 900000)),
          extraBarcodes: '',
          category: 'عام',
          costPrice: cost,
          sellPrice: sell,
          stock: qty,
          minStock: 5,
          unit: item.unit || 'قطعة',
          supplier: invoiceSupplier || 'مورد عام',
          expiryDate: '',
          offerQty: 0,
          offerPrice: 0,
          isFavorite: true,
          lastBuyDate: todayStr,
          lastSellDate: ''
        });
      }

      newPurchasesList.push({
        id: 'PUR-' + Date.now().toString().slice(-4) + idx,
        date: todayStr,
        supplier: invoiceSupplier || 'مورد عام',
        productName: item.name,
        qty,
        costPrice: cost,
        total: qty * cost
      });
    });

    setProducts(updatedProducts);
    setPurchases(prev => [...newPurchasesList, ...prev]);
    setExtractedInvoiceItems([]);
    addLog('اعتماد فاتورة مورد ذكية', `تم توريد ${newPurchasesList.length} أصناف من ${invoiceSupplier}`);
    showToast('تم اعتماد فاتورة المورد وإضافة جميع الأصناف للمخزون!');
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter(s => s.date === todayStr);
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayCashSales = todaySales
    .filter(s => s.paymentMethod === 'نقدي')
    .reduce((sum, s) => sum + s.total, 0);
  const todayProfit = todaySales.reduce((sum, s) => sum + (s.profit || 0), 0);
  const todayPurchasesTotal = purchases
    .filter(p => p.date === todayStr)
    .reduce((sum, p) => sum + p.total, 0);
  const todayExpensesTotal = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const expectedDrawerCash =
    Number(settings.openingCash || 0) + todayCashSales - todayExpensesTotal - todayPurchasesTotal;

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const exportBackupJSON = () => {
    const backup = {
      products, sales, purchases, expenses, customers, suppliers, settings, auditLogs,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_سوبرماركت_${todayStr}.json`;
    a.click();
    showToast('تم تحميل النسخة الاحتياطية بنجاح');
  };

  const importBackupJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.products) setProducts(data.products);
        if (data.sales) setSales(data.sales);
        if (data.purchases) setPurchases(data.purchases);
        if (data.expenses) setExpenses(data.expenses);
        if (data.customers) setCustomers(data.customers);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.settings) setSettings(data.settings);
        showToast('تمت استعادة النسخة الاحتياطية بالكامل بنجاح!');
      } catch (err) {
        showToast('ملف النسخة الاحتياطية غير صالح', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-900 pb-24">
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-3.5 rounded-2xl shadow-xl flex items-center justify-between text-white font-bold text-sm transition-all ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-700'
          }`}
        >
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {showCameraScanner && (
        <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <Camera className="w-5 h-5" />
                <span>وجّه الكاميرا نحو الباركود</span>
              </div>
              <button
                onClick={() => setShowCameraScanner(false)}
                className="bg-white/20 px-3 py-1 rounded-xl text-sm font-bold"
              >
                إغلاق
              </button>
            </div>
            <div id="reader-container" className="w-full min-h-[260px] bg-black" />
            <div className="p-4 bg-slate-50 text-center text-xs text-slate-600 font-semibold">
              يتم قراءة الباركود تلقائياً بمجرد ظهوره أمام الكاميرا
            </div>
          </div>
        </div>
      )}

      <header className="bg-emerald-800 text-white px-4 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {activeTab !== 'home' && (
            <button
              onClick={() => setActiveTab('home')}
              className="bg-emerald-700 hover:bg-emerald-600 p-2 rounded-xl"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="font-black text-base leading-tight">{settings.storeName}</h1>
            <p className="text-[11px] text-emerald-200 font-semibold">
              {todayStr} • يعمل بدون إنترنت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setScannerTarget('pos');
              setActiveTab('pos');
              setShowCameraScanner(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
          >
            <ScanBarcode className="w-4 h-4" />
            <span>مسح سريع</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-3.5">
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-sm text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>ملخص حركة اليوم</span>
                </h2>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                  {todaySales.length} عملية بيع
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                  <p className="text-xs text-emerald-700 font-bold">مبيعات اليوم</p>
                  <p className="text-lg font-black text-emerald-900 mt-0.5">
                    {todaySalesTotal.toFixed(2)} <span className="text-xs">ج.م</span>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                  <p className="text-xs text-blue-700 font-bold">الأرباح التقديرية</p>
                  <p className="text-lg font-black text-blue-900 mt-0.5">
                    {todayProfit.toFixed(2)} <span className="text-xs">ج.م</span>
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl">
                  <p className="text-xs text-amber-800 font-bold">النقدية المتوقعة بالدرج</p>
                  <p className="text-lg font-black text-amber-900 mt-0.5">
                    {expectedDrawerCash.toFixed(2)} <span className="text-xs">ج.م</span>
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-100 p-3 rounded-2xl">
                  <p className="text-xs text-purple-700 font-bold">مشتريات اليوم</p>
                  <p className="text-base font-black text-purple-900 mt-0.5">
                    {todayPurchasesTotal.toFixed(2)} <span className="text-xs">ج.م</span>
                  </p>
                </div>

                <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl">
                  <p className="text-xs text-rose-700 font-bold">المصروفات اليومية</p>
                  <p className="text-base font-black text-rose-900 mt-0.5">
                    {todayExpensesTotal.toFixed(2)} <span className="text-xs">ج.م</span>
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('inventory')}
                  className="bg-orange-50 border border-orange-200 p-3 rounded-2xl cursor-pointer"
                >
                  <p className="text-xs text-orange-800 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                    <span>نواقص المخزون</span>
                  </p>
                  <p className="text-base font-black text-orange-900 mt-0.5">
                    {lowStockProducts.length} <span className="text-xs">أصناف</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('pos')}
                className="col-span-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white p-5 rounded-3xl shadow-md flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <ShoppingCart className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-lg">تسجيل بيع جديد (الكاشير)</h3>
                    <p className="text-xs text-emerald-100 font-semibold">
                      بيع سريع بالباركود أو اللمس أو الصوت
                    </p>
                  </div>
                </div>
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => setActiveTab('purchases')}
                className="bg-white hover:bg-slate-50 active:scale-95 p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-2"
              >
                <div className="bg-blue-100 text-blue-700 p-3.5 rounded-2xl">
                  <PackagePlus className="w-7 h-7" />
                </div>
                <span className="font-black text-sm">تسجيل واردات (بضاعة)</span>
                <span className="text-[11px] text-slate-500 font-semibold">بالكاميرا والذكاء الاصطناعي</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className="bg-white hover:bg-slate-50 active:scale-95 p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-2"
              >
                <div className="bg-amber-100 text-amber-700 p-3.5 rounded-2xl">
                  <Package className="w-7 h-7" />
                </div>
                <span className="font-black text-sm">المنتجات والمخزون</span>
                <span className="text-[11px] text-slate-500 font-semibold">{products.length} صنف مسجل</span>
              </button>

              <button
                onClick={() => {
                  setScannerTarget('pos');
                  setActiveTab('pos');
                  setShowCameraScanner(true);
                }}
                className="bg-white hover:bg-slate-50 active:scale-95 p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-2"
              >
                <div className="bg-emerald-100 text-emerald-700 p-3.5 rounded-2xl">
                  <ScanBarcode className="w-7 h-7" />
                </div>
                <span className="font-black text-sm">تصوير باركود منتج</span>
                <span className="text-[11px] text-slate-500 font-semibold">بيع أو فحص سعر فوري</span>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className="bg-white hover:bg-slate-50 active:scale-95 p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-2"
              >
                <div className="bg-indigo-100 text-indigo-700 p-3.5 rounded-2xl">
                  <Users className="w-7 h-7" />
                </div>
                <span className="font-black text-sm">حسابات العملاء (الآجل)</span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  إجمالي: {customers.reduce((s, c) => s + c.balance, 0)} ج.م
                </span>
              </button>

              <button
                onClick={() => setActiveTab('suppliers')}
                className="bg-white hover:bg-slate-50 active:scale-95 p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-2"
              >
                <div className="bg-cyan-100 text-cyan-700 p-3.5 rounded-2xl">
                  <Truck className="w-7 h-7" />
                </div>
                <span className="font-black text-sm">حسابات الموردين</span>
                <span className="text-[11px] text-slate-500 font-semibold">كشف حساب ومستحقات</span>
              </button>

              <button
                onClick={() => setActiveTab('expenses')}
                className="bg-white hover:bg-slate-50 active:scale-95 p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-2"
              >
                <div className="bg-rose-100 text-rose-700 p-3.5 rounded-2xl">
                  <Wallet className="w-7 h-7" />
                </div>
                <span className="font-black text-sm">المصروفات اليومية</span>
                <span className="text-[11px] text-slate-500 font-semibold">كهرباء، إيجار، يوميات</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="bg-white hover:bg-slate-50 active:scale-95 p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-2"
              >
                <div className="bg-purple-100 text-purple-700 p-3.5 rounded-2xl">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <span className="font-black text-sm">التقارير والأرباح</span>
                <span className="text-[11px] text-slate-500 font-semibold">تصدير Excel وطباعة</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="bg-white hover:bg-slate-50 active:scale-95 p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-2"
              >
                <div className="bg-slate-200 text-slate-700 p-3.5 rounded-2xl">
                  <Settings className="w-7 h-7" />
                </div>
                <span className="font-black text-sm">الإعدادات والنسخ الاحتياطي</span>
                <span className="text-[11px] text-slate-500 font-semibold">حفظ واستعادة البيانات</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && posSearch.trim()) {
                      const exact = products.find(
                        p => p.barcode === posSearch.trim() || p.name.includes(posSearch.trim())
                      );
                      if (exact) {
                        addToCart(exact, 1);
                        setPosSearch('');
                      }
                    }
                  }}
                  placeholder="ابحث بالاسم أو امسح الباركود..."
                  className="w-full bg-slate-100 rounded-2xl pr-9 pl-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <button
                onClick={() => {
                  setScannerTarget('pos');
                  setShowCameraScanner(true);
                }}
                className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow"
                title="مسح بالكاميرا"
              >
                <Camera className="w-5 h-5" />
              </button>

              <button
                onClick={() => startVoiceSearch((txt) => setPosSearch(txt))}
                className="bg-blue-600 text-white p-2.5 rounded-2xl shadow"
                title="بحث صوتي"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => {
                  if (cart.length === 0) return;
                  setHeldCarts(prev => [...prev, { id: Date.now(), items: cart }]);
                  setCart([]);
                  showToast('تم تعليق الفاتورة مؤقتاً لخدمة زبون آخر');
                }}
                className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shrink-0"
              >
                <PauseCircle className="w-4 h-4" />
                <span>تعليق الفاتورة</span>
              </button>

              {heldCarts.map((hc, idx) => (
                <button
                  key={hc.id}
                  onClick={() => {
                    setCart(hc.items);
                    setHeldCarts(prev => prev.filter(x => x.id !== hc.id));
                  }}
                  className="bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shrink-0"
                >
                  استكمال فاتورة #{idx + 1} ({hc.items.length})
                </button>
              ))}

              {sales.length > 0 && (
                <button
                  onClick={() => {
                    setCart(sales[0].items);
                    showToast('تم تكرار أصناف آخر فاتورة بيع');
                  }}
                  className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تكرار آخر بيع</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1">
              {products
                .filter(
                  p =>
                    !posSearch.trim() ||
                    p.name.includes(posSearch.trim()) ||
                    p.barcode.includes(posSearch.trim())
                )
                .slice(0, 12)
                .map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product, 1)}
                    className="bg-white hover:bg-emerald-50 active:scale-95 p-2.5 rounded-2xl border border-slate-200 text-right flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <p className="font-black text-xs text-slate-800 line-clamp-1">{product.name}</p>
                      <p className="text-[11px] text-slate-500">
                        المتاح: {product.stock} {product.unit}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-2 py-0.5 rounded-lg">
                        {product.sellPrice} ج
                      </span>
                      {product.offerQty > 0 && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          {product.offerQty} بـ {product.offerPrice}ج
                        </span>
                      )}
                    </div>
                  </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-black text-sm flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <span>الفاتورة الحالية ({cart.length} أصناف)</span>
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-xs text-red-600 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إفراغ</span>
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-6 font-bold">
                  اضغط على أي منتج بالأعلى أو امسح الباركود لإضافته للفاتورة
                </p>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-black text-xs text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            سعر الوحدة: {item.sellPrice} ج / {item.unit}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-black text-sm text-emerald-700">
                            {calculateItemTotal(item).toFixed(2)} ج
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCartQty(item.id, Number((item.qty + 1).toFixed(3)))}
                            className="bg-emerald-600 text-white w-7 h-7 rounded-xl flex items-center justify-center font-black"
                          >
                            +
                          </button>
                          <input
                            type="number"
                            step="any"
                            value={item.qty}
                            onChange={(e) => updateCartQty(item.id, parseFloat(e.target.value) || 0)}
                            className="w-16 text-center bg-white border border-slate-300 rounded-xl py-1 text-xs font-black"
                          />
                          <button
                            onClick={() => updateCartQty(item.id, Number((item.qty - 1).toFixed(3)))}
                            className="bg-slate-200 text-slate-800 w-7 h-7 rounded-xl flex items-center justify-center font-black"
                          >
                            -
                          </button>

                          {item.unit === 'كيلو' && (
                            <>
                              <button
                                onClick={() => updateCartQty(item.id, 0.5)}
                                className="bg-amber-100 text-amber-900 px-2 py-1 rounded-lg text-[11px] font-black"
                              >
                                ½ ك
                              </button>
                              <button
                                onClick={() => updateCartQty(item.id, 0.25)}
                                className="bg-amber-100 text-amber-900 px-2 py-1 rounded-lg text-[11px] font-black"
                              >
                                ¼ ك
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => updateCartQty(item.id, 0)}
                          className="text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">خصم على الفاتورة (ج.م)</label>
                    <input
                      type="number"
                      value={invoiceDiscount}
                      onChange={(e) => setInvoiceDiscount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-black mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">المبلغ المدفوع من الزبون</label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder={cartFinalTotal.toFixed(2)}
                      className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-black mt-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['نقدي', 'محفظة / إنستاباي', 'آجل'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-xl text-xs font-black border ${
                        paymentMethod === method
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'آجل' && (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-xs font-black"
                  >
                    <option value="">-- اختر اسم العميل لتسجيل الدين --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (رصيده الحالي: {c.balance} ج.م)
                      </option>
                    ))}
                  </select>
                )}

                <div className="bg-emerald-900 text-white p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-200 font-bold">الإجمالي المطلوب</p>
                    <p className="text-2xl font-black">{cartFinalTotal.toFixed(2)} ج.م</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-amber-300 font-bold">الباقي للزبون</p>
                    <p className="text-xl font-black text-amber-300">{changeDue.toFixed(2)} ج.م</p>
                  </div>
                </div>

                <button
                  onClick={completeSale}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black py-4 rounded-2xl shadow-lg text-base flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>إنهاء البيع وحفظ الفاتورة</span>
                </button>
              </div>
            </div>

            {lastReceipt && (
              <div id="printable-receipt" className="bg-white p-4 rounded-3xl border-2 border-emerald-600 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-emerald-800">
                    تم حفظ الفاتورة {lastReceipt.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة بلوتوث</span>
                    </button>
                    <button
                      onClick={() => shareReceiptWhatsApp(lastReceipt)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
              <h2 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>الإدخال الذكي للواردات بالكاميرا والذكاء الاصطناعي</span>
              </h2>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setScannerTarget('purchase');
                    setShowCameraScanner(true);
                  }}
                  className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex flex-col items-center text-center gap-1.5"
                >
                  <ScanBarcode className="w-6 h-6 text-emerald-700" />
                  <span className="font-black text-xs text-emerald-900">1. تصوير الباركود</span>
                </button>

                <label className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 cursor-pointer">
                  <Camera className="w-6 h-6 text-blue-700" />
                  <span className="font-black text-xs text-blue-900">2. تصوير اسم العبوة</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => { analyzeImageWithGemini(e.target.files?.[0], 'product'); e.target.value = ''; }}
                  />
                </label>

                <label className="bg-purple-50 border border-purple-200 p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 cursor-pointer">
                  <FileText className="w-6 h-6 text-purple-700" />
                  <span className="font-black text-xs text-purple-900">3. تصوير فاتورة مورد</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => { analyzeImageWithGemini(e.target.files?.[0], 'invoice'); e.target.value = ''; }}
                  />
                </label>
              </div>

              {aiLoading && (
                <div className="bg-blue-600 text-white p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري قراءة الصورة واستخراج البيانات بالذكاء الاصطناعي...</span>
                </div>
              )}
            </div>

            {extractedInvoiceItems.length > 0 && (
              <div className="bg-purple-50 border-2 border-purple-400 p-4 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-purple-950">
                    مراجعة فاتورة المورد ({invoiceSupplier})
                  </h3>
                  <button
                    onClick={() => setExtractedInvoiceItems([])}
                    className="text-xs text-red-600 font-bold"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="space-y-2">
                  {extractedInvoiceItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-2xl grid grid-cols-4 gap-2 items-center">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const copy = [...extractedInvoiceItems];
                          copy[idx].name = e.target.value;
                          setExtractedInvoiceItems(copy);
                        }}
                        className="col-span-2 bg-slate-100 rounded-xl px-2 py-1.5 text-xs font-bold"
                      />
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => {
                          const copy = [...extractedInvoiceItems];
                          copy[idx].qty = e.target.value;
                          setExtractedInvoiceItems(copy);
                        }}
                        placeholder="الكمية"
                        className="bg-slate-100 rounded-xl px-2 py-1.5 text-xs font-bold"
                      />
                      <input
                        type="number"
                        value={item.costPrice}
                        onChange={(e) => {
                          const copy = [...extractedInvoiceItems];
                          copy[idx].costPrice = e.target.value;
                          setExtractedInvoiceItems(copy);
                        }}
                        placeholder="سعر الشراء"
                        className="bg-slate-100 rounded-xl px-2 py-1.5 text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={approveExtractedInvoice}
                  className="w-full bg-purple-700 text-white font-black py-3 rounded-2xl text-sm shadow"
                >
                  اعتماد الفاتورة وإضافة الكل للمخزون
                </button>
              </div>
            )}

            <form onSubmit={handleSavePurchase} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-black text-sm text-slate-800">بيانات المنتج الوارد</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">اسم المنتج والوزن</label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.name}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, name: e.target.value })}
                    placeholder="مثال: جهينة مانجو 1 لتر"
                    className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">رقم الباركود</label>
                  <input
                    type="text"
                    value={purchaseForm.barcode}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, barcode: e.target.value })}
                    placeholder="امسح بالكاميرا أو اتركه للتوليد التلقائي"
                    className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">الكمية الواردة</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={purchaseForm.qty}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, qty: e.target.value })}
                    placeholder="مثال: 24"
                    className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">وحدة البيع</label>
                  <select
                    value={purchaseForm.unit}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, unit: e.target.value })}
                    className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                  >
                    <option value="قطعة">قطعة</option>
                    <option value="عبوة">عبوة</option>
                    <option value="كيلو">كيلو</option>
                    <option value="لتر">لتر</option>
                    <option value="كرتونة">كرتونة</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">سعر شراء الوحدة (ج.م)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={purchaseForm.costPrice}
                    onChange={(e) => {
                      const cost = e.target.value;
                      const suggestedSell = cost
                        ? Number((Number(cost) * (1 + purchaseForm.marginPercent / 100)).toFixed(2))
                        : '';
                      setPurchaseForm({ ...purchaseForm, costPrice: cost, sellPrice: suggestedSell });
                    }}
                    className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">
                    سعر البيع للجمهور (هامش ربح مقترح {purchaseForm.marginPercent}%)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={purchaseForm.sellPrice}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, sellPrice: e.target.value })}
                    className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-xs font-black mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">اسم المورد</label>
                  <input
                    type="text"
                    value={purchaseForm.supplierName}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })}
                    placeholder="اختياري"
                    className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">تاريخ انتهاء الصلاحية</label>
                  <input
                    type="date"
                    value={purchaseForm.expiryDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl shadow text-sm"
              >
                حفظ الواردات وإضافتها للمخزون
              </button>
            </form>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between gap-2">
              <input
                type="text"
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                placeholder="ابحث عن منتج لتعديل السعر أو الجرد..."
                className="flex-1 bg-slate-100 rounded-2xl px-3.5 py-2.5 text-xs font-bold"
              />
              <button
                onClick={() => {
                  const pct = prompt('أدخل نسبة زيادة الأسعار لجميع المنتجات (مثال: 5 لزيادة 5%):');
                  if (!pct || isNaN(Number(pct))) return;
                  const factor = 1 + Number(pct) / 100;
                  setProducts(prev =>
                    prev.map(p => ({ ...p, sellPrice: Math.ceil(p.sellPrice * factor) }))
                  );
                  addLog('تعديل أسعار جماعي', `تعديل أسعار جميع الأصناف بنسبة ${pct}%`);
                  showToast(`تم تعديل أسعار جميع المنتجات بنسبة ${pct}%`);
                }}
                className="bg-amber-500 text-slate-950 px-3 py-2.5 rounded-2xl text-xs font-black shrink-0"
              >
                تعديل جماعي للأسعار
              </button>
            </div>

            <div className="space-y-2.5">
              {products
                .filter(p => !posSearch.trim() || p.name.includes(posSearch) || p.barcode.includes(posSearch))
                .map(p => {
                  const margin = p.costPrice > 0 ? (((p.sellPrice - p.costPrice) / p.costPrice) * 100).toFixed(1) : 0;
                  const isLow = p.stock <= p.minStock;
                  return (
                    <div
                      key={p.id}
                      className={`bg-white p-3.5 rounded-3xl shadow-sm border ${
                        isLow ? 'border-orange-400 bg-orange-50/30' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-black text-sm text-slate-900">{p.name}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            باركود: {p.barcode} • التصنيف: {p.category}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          المخزون: {p.stock} {p.unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">سعر الشراء</span>
                          <span className="font-black">{p.costPrice} ج.م</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">سعر البيع (ربح {margin}%)</span>
                          <span className="font-black text-emerald-700">{p.sellPrice} ج.م</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const newPrice = prompt(`تعديل سعر بيع (${p.name}):`, p.sellPrice);
                              if (newPrice && !isNaN(Number(newPrice))) {
                                setProducts(prev =>
                                  prev.map(x => (x.id === p.id ? { ...x, sellPrice: Number(newPrice) } : x))
                                );
                                addLog('تعديل سعر', `${p.name}: من ${p.sellPrice} إلى ${newPrice} ج`);
                                showToast('تم تحديث السعر');
                              }
                            }}
                            className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-xs"
                          >
                            سعر
                          </button>
                          <button
                            onClick={() => {
                              const actualQty = prompt(`الجرد الفعلي للصنف (${p.name}) في المحل:`, p.stock);
                              if (actualQty !== null && !isNaN(Number(actualQty))) {
                                const diff = Number(actualQty) - p.stock;
                                setProducts(prev =>
                                  prev.map(x => (x.id === p.id ? { ...x, stock: Number(actualQty) } : x))
                                );
                                addLog('تسوية جرد', `${p.name}: فرق الجرد (${diff})`);
                                showToast('تم تحديث الكمية الفعلية');
                              }
                            }}
                            className="bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-xl font-bold text-xs"
                          >
                            جرد
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-indigo-900 text-white p-4 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-200 font-bold">إجمالي ديون العملاء بالخارج</p>
                <p className="text-2xl font-black">
                  {customers.reduce((sum, c) => sum + c.balance, 0).toFixed(2)} ج.م
                </p>
              </div>
              <button
                onClick={() => {
                  const name = prompt('اسم العميل الجديد:');
                  if (!name) return;
                  const phone = prompt('رقم هاتف العميل (اختياري):') || '';
                  setCustomers(prev => [
                    ...prev,
                    { id: 'c_' + Date.now(), name, phone, balance: 0, transactions: [] }
                  ]);
                  showToast('تمت إضافة العميل');
                }}
                className="bg-white text-indigo-950 px-3.5 py-2 rounded-2xl text-xs font-black"
              >
                + عميل جديد
              </button>
            </div>

            <div className="space-y-2.5">
              {customers.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-500">{c.phone || 'بدون رقم هاتف'}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-slate-500 font-bold">المبلغ المستحق</p>
                      <p className="text-base font-black text-red-600">{c.balance.toFixed(2)} ج.م</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <button
                      onClick={() => {
                        const paid = prompt(`تسجيل دفعة مسددة من (${c.name}):`);
                        if (!paid || isNaN(Number(paid))) return;
                        const amount = Number(paid);
                        setCustomers(prev =>
                          prev.map(x =>
                            x.id === c.id
                              ? {
                                  ...x,
                                  balance: Math.max(0, x.balance - amount),
                                  transactions: [
                                    { id: Date.now().toString(), date: todayStr, type: 'سداد نقدي', amount: -amount },
                                    ...(x.transactions || [])
                                  ]
                                }
                              : x
                          )
                        );
                        showToast('تم تسجيل السداد وخصمه من حساب العميل');
                      }}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-xs font-black"
                    >
                      تسجيل سداد دفعة
                    </button>

                    <button
                      onClick={() => {
                        const msg = `*كشف حساب من ${settings.storeName}*\nالسيد: ${c.name}\nإجمالي الرصيد المستحق: *${c.balance.toFixed(2)} ج.م*\nتاريخ الكشف: ${todayStr}`;
                        window.open(`https://wa.me/${c.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-green-100 text-green-800 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>مشاركة واتساب</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="bg-cyan-900 text-white p-4 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-200 font-bold">إجمالي مستحقات الموردين</p>
                <p className="text-2xl font-black">
                  {suppliers.reduce((sum, s) => sum + s.balance, 0).toFixed(2)} ج.م
                </p>
              </div>
              <button
                onClick={() => {
                  const name = prompt('اسم المورد أو الشركة:');
                  if (!name) return;
                  const phone = prompt('رقم الهاتف:') || '';
                  const productsList = prompt('الأصناف التي يوردها:') || 'مواد غذائية';
                  setSuppliers(prev => [
                    ...prev,
                    { id: 's_' + Date.now(), name, phone, products: productsList, balance: 0, lastBuyDate: todayStr }
                  ]);
                  showToast('تم تسجيل المورد');
                }}
                className="bg-white text-cyan-950 px-3.5 py-2 rounded-2xl text-xs font-black"
              >
                + مورد جديد
              </button>
            </div>

            <div className="space-y-2.5">
              {suppliers.map(s => (
                <div key={s.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm">{s.name}</h4>
                      <p className="text-xs text-slate-500">{s.products} • {s.phone}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-slate-500">له رصيد متبقي</p>
                      <p className="text-base font-black text-cyan-800">{s.balance.toFixed(2)} ج.م</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      onClick={() => {
                        const paid = prompt(`تسجيل دفعة مسددة للمورد (${s.name}):`);
                        if (!paid || isNaN(Number(paid))) return;
                        setSuppliers(prev =>
                          prev.map(x => (x.id === s.id ? { ...x, balance: Math.max(0, x.balance - Number(paid)) } : x))
                        );
                        showToast('تم خصم الدفعة من حساب المورد');
                      }}
                      className="flex-1 bg-cyan-700 text-white py-2 rounded-xl text-xs font-black"
                    >
                      سداد دفعة للمورد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const amount = Number(form.amount.value);
                const category = form.category.value;
                const notes = form.notes.value;
                if (!amount) return;
                setExpenses(prev => [
                  { id: 'exp_' + Date.now(), date: todayStr, amount, category, notes },
                  ...prev
                ]);
                form.reset();
                showToast('تم تسجيل المصروف');
              }}
              className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3"
            >
              <h3 className="font-black text-sm">تسجيل مصروف جديد</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  name="amount"
                  type="number"
                  step="any"
                  required
                  placeholder="المبلغ (ج.م)"
                  className="bg-slate-100 rounded-xl p-2.5 text-xs font-bold"
                />
                <select name="category" className="bg-slate-100 rounded-xl p-2.5 text-xs font-bold">
                  <option value="كهرباء ومياه">كهرباء ومياه</option>
                  <option value="إيجار">إيجار</option>
                  <option value="نقل ومشال">نقل ومشال</option>
                  <option value="أجور ويوميات">أجور ويوميات</option>
                  <option value="أكياس وتغليف">أكياس وتغليف</option>
                  <option value="مصروفات أخرى">مصروفات أخرى</option>
                </select>
              </div>
              <input
                name="notes"
                type="text"
                placeholder="ملاحظات إضافية..."
                className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold"
              />
              <button type="submit" className="w-full bg-rose-600 text-white font-black py-3 rounded-2xl text-xs">
                حفظ المصروف
              </button>
            </form>

            <div className="space-y-2">
              {expenses.map(exp => (
                <div key={exp.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-black text-xs">{exp.category}</p>
                    <p className="text-[11px] text-slate-500">{exp.date} • {exp.notes}</p>
                  </div>
                  <span className="font-black text-sm text-rose-700">{exp.amount} ج.م</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm">التقارير المالية وحركة المحل</h3>
                <button
                  onClick={() => {
                    const csvRows = [
                      ['رقم الفاتورة', 'التاريخ', 'الوقت', 'الإجمالي', 'الربح', 'طريقة الدفع'],
                      ...sales.map(s => [s.id, s.date, s.time, s.total, s.profit, s.paymentMethod])
                    ];
                    const csvContent = '\uFEFF' + csvRows.map(r => r.join(',')).join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `تقرير_المبيعات_${todayStr}.csv`;
                    a.click();
                    showToast('تم تصدير التقرير لملف Excel بنجاح');
                  }}
                  className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير Excel</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-500 block">إجمالي المبيعات الكلي</span>
                  <span className="font-black text-base">
                    {sales.reduce((s, x) => s + x.total, 0).toFixed(2)} ج.م
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-500 block">صافي الأرباح الكلي</span>
                  <span className="font-black text-base text-emerald-700">
                    {sales.reduce((s, x) => s + (x.profit || 0), 0).toFixed(2)} ج.م
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-500 block">قيمة البضاعة بالمخزن (بسعر الشراء)</span>
                  <span className="font-black text-base text-blue-700">
                    {products.reduce((s, p) => s + p.costPrice * p.stock, 0).toFixed(2)} ج.م
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-500 block">قيمة البضاعة بالمخزن (بسعر البيع)</span>
                  <span className="font-black text-base text-purple-700">
                    {products.reduce((s, p) => s + p.sellPrice * p.stock, 0).toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-2.5">
              <h4 className="font-black text-xs text-slate-700">أحدث فواتير البيع</h4>
              {sales.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">لا توجد فواتير مسجلة بعد</p>
              ) : (
                sales.slice(0, 15).map(s => (
                  <div key={s.id} className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-black">{s.id} ({s.paymentMethod})</p>
                      <p className="text-[11px] text-slate-500">{s.date} - {s.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-800">{s.total.toFixed(2)} ج</span>
                      <button
                        onClick={() => shareReceiptWhatsApp(s)}
                        className="bg-green-100 text-green-800 p-1.5 rounded-lg"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-black text-sm">بيانات المحل والذكاء الاصطناعي</h3>

              <div>
                <label className="text-xs font-bold text-slate-600">اسم السوبر ماركت / البقالة</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">عهدة النقدية في درج الكاشير صباحاً (ج.م)</label>
                <input
                  type="number"
                  value={settings.openingCash}
                  onChange={(e) => setSettings({ ...settings, openingCash: Number(e.target.value) })}
                  className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">
                  مفتاح Gemini API Key (لقراءة الفواتير والعبوات بالكاميرا)
                </label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-black text-sm">النسخ الاحتياطي وحماية البيانات</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={exportBackupJSON}
                  className="bg-emerald-700 text-white p-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>حفظ نسخة احتياطية</span>
                </button>

                <label className="bg-blue-600 text-white p-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>استعادة نسخة محفوظة</span>
                  <input type="file" accept=".json" className="hidden" onChange={importBackupJSON} />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around z-40 shadow-lg">
        {[
          { id: 'home', label: 'الرئيسية', icon: BarChart3 },
          { id: 'pos', label: 'الكاشير', icon: ShoppingCart },
          { id: 'purchases', label: 'الواردات', icon: PackagePlus },
          { id: 'inventory', label: 'المخزون', icon: Package },
          { id: 'customers', label: 'الآجل', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
                isActive ? 'text-emerald-700 font-black bg-emerald-50' : 'text-slate-500 font-bold'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
