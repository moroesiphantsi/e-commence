import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Container, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Button, 
  Badge, 
  Card, 
  CardContent, 
  CardActions, 
  Grid, 
  TextField, 
  InputAdornment, 
  Tabs, 
  Tab, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Slider, 
  Chip, 
  Paper, 
  Alert, 
  Snackbar,
  LinearProgress
} from '@mui/material';

// --- MUI ICONS ---
import WifiIcon from '@mui/icons-material/Wifi';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import ShieldIcon from '@mui/icons-material/Shield';
import ZapIcon from '@mui/icons-material/FlashOn';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import MapPinIcon from '@mui/icons-material/Place';
import GaugeIcon from '@mui/icons-material/Speed';
import HomeIcon from '@mui/icons-material/Home';
import MessageSquareIcon from '@mui/icons-material/Chat';
import SunIcon from '@mui/icons-material/LightMode';
import MoonIcon from '@mui/icons-material/DarkMode';

// --- FIREBASE IMPORT ---
import { db } from '../firebase'; 
import { ref, onValue, set, push, update } from 'firebase/database';

// --- TYPES & INTERFACES ---
interface Product {
  id: string;
  name: string;
  speed: string;
  price: number;
  type: 'Fibre' | 'LTE' | 'Mesh Wi-Fi';
  popular?: boolean;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Bill {
  id: string;
  accountNo: string;
  month: string;
  amount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid';
}

interface PaymentReceipt {
  transactionId: string;
  date: string;
  accountNo: string;
  amountPaid: number;
  paymentMethod: string;
  description: string;
}

const PRODUCTS: Product[] = [
  // --- Telkom FTTH Postpaid ---
  { id: 'p1', name: 'Telkom FTTH Easy 20/10 Mbps', speed: '20/10 Mbps', price: 345, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 20/10 Mbps connectivity.' },
  { id: 'p2', name: 'Telkom FTTH Easy 40/20 Mbps', speed: '40/20 Mbps', price: 425, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 40/20 Mbps connectivity.' },
  { id: 'p3', name: 'Telkom FTTH Core/Stream 25/25 Mbps', speed: '25/25 Mbps', price: 499, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 25/25 Mbps connectivity.' },
  { id: 'p4', name: 'Telkom FTTH Core/Stream 30/30 Mbps', speed: '30/30 Mbps', price: 519, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 30/30 Mbps connectivity.' },
  { id: 'p5', name: 'Telkom FTTH Core/Stream 50/25 Mbps', speed: '50/25 Mbps', price: 695, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 50/25 Mbps connectivity.' },
  { id: 'p6', name: 'Telkom FTTH Core/Stream 50/50 Mbps', speed: '50/50 Mbps', price: 805, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 50/50 Mbps connectivity.' },
  { id: 'p7', name: 'Telkom FTTH Core/Stream 100/50 Mbps', speed: '100/50 Mbps', price: 895, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 100/50 Mbps connectivity.' },
  { id: 'p8', name: 'Telkom FTTH Core/Stream 100/100 Mbps', speed: '100/100 Mbps', price: 1025, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 100/100 Mbps connectivity.' },
  { id: 'p9', name: 'Telkom FTTH Core/Stream 200/100 Mbps', speed: '200/100 Mbps', price: 1299, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 200/100 Mbps connectivity.' },
  { id: 'p10', name: 'Telkom FTTH Core/Stream 200/200 Mbps', speed: '200/200 Mbps', price: 1365, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 200/200 Mbps connectivity.' },
  { id: 'p11', name: 'Telkom FTTH Core/Stream 300/150 Mbps', speed: '300/150 Mbps', price: 1529, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 300/150 Mbps connectivity.' },
  { id: 'p12', name: 'Telkom FTTH Core/Stream 500/250 Mbps', speed: '500/250 Mbps', price: 1699, type: 'Fibre', popular: true, description: 'Telkom FTTH Postpaid package offering 500/250 Mbps connectivity.' },
  { id: 'p13', name: 'Telkom FTTH Custom Package', speed: 'Custom', price: 0, type: 'Fibre', description: 'Enter custom package parameters.' },

  // --- Telkom LTE ---
  { id: 'p14', name: 'Telkom LTE 10 Mbps Unlimited', speed: '10 Mbps', price: 299, type: 'LTE', description: 'Telkom LTE package with unlimited data at 10 Mbps speed.' },
  { id: 'p15', name: 'Telkom LTE 20 Mbps Unlimited', speed: '20 Mbps', price: 449, type: 'LTE', description: 'Telkom LTE package with unlimited data at 20 Mbps speed.' },
  { id: 'p16', name: 'Telkom LTE 30 Mbps Unlimited', speed: '30 Mbps', price: 599, type: 'LTE', popular: true, description: 'Telkom LTE package with unlimited data at 30 Mbps speed.' },
  { id: 'p17', name: 'Telkom LTE 2TB Data', speed: 'Unthrottled', price: 699, type: 'LTE', description: 'Telkom LTE package providing 2TB high-speed monthly data.' },
  { id: 'p18', name: 'Telkom LTE Custom Package', speed: 'Custom', price: 0, type: 'LTE', description: 'Enter custom LTE package parameters.' },

  // --- Prepaid Fibre Packages ---
  { id: 'p19', name: 'Prepaid Fibre 20/10Mbps 30Days', speed: '20/10 Mbps', price: 349, type: 'Fibre', description: 'Prepaid Fibre 20/10Mbps valid for 30 days.' },
  { id: 'p20', name: 'Prepaid Stream Connect 25/25Mbps 30Days', speed: '25/25 Mbps', price: 499, type: 'Fibre', description: 'Prepaid Stream Connect 25/25Mbps valid for 30 days.' },
  { id: 'p21', name: 'Prepaid Stream Connect 50/25Mbps 30Days', speed: '50/25 Mbps', price: 700, type: 'Fibre', description: 'Prepaid Stream Connect 50/25Mbps valid for 30 days.' },
  { id: 'p22', name: 'Prepaid Custom Voucher', speed: 'Custom', price: 0, type: 'Fibre', description: 'Enter custom prepaid voucher value.' },

  // --- Telkom Business Fibre Packages ---
  { id: 'p23', name: 'Telkom Business Easy 20/10 Mbps', speed: '20/10 Mbps', price: 345, type: 'Fibre', description: 'Telkom Business Fibre package with 20/10 Mbps speed.' },
  { id: 'p24', name: 'Telkom Business Easy 40/20 Mbps', speed: '40/20 Mbps', price: 425, type: 'Fibre', description: 'Telkom Business Fibre package with 40/20 Mbps speed.' },
  { id: 'p25', name: 'Telkom Business Core/Stream 25/25 Mbps', speed: '25/25 Mbps', price: 499, type: 'Fibre', description: 'Telkom Business Fibre package with 25/25 Mbps speed.' },
  { id: 'p26', name: 'Telkom Business Core/Stream 30/30 Mbps', speed: '30/30 Mbps', price: 519, type: 'Fibre', description: 'Telkom Business Fibre package with 30/30 Mbps speed.' },
  { id: 'p27', name: 'Telkom Business Core/Stream 50/25 Mbps', speed: '50/25 Mbps', price: 695, type: 'Fibre', description: 'Telkom Business Fibre package with 50/25 Mbps speed.' },
  { id: 'p28', name: 'Telkom Business Core/Stream 50/50 Mbps', speed: '50/50 Mbps', price: 805, type: 'Fibre', description: 'Telkom Business Fibre package with 50/50 Mbps speed.' },
  { id: 'p29', name: 'Telkom Business Core/Stream 100/50 Mbps', speed: '100/50 Mbps', price: 895, type: 'Fibre', description: 'Telkom Business Fibre package with 100/50 Mbps speed.' },
  { id: 'p30', name: 'Telkom Business Core/Stream 100/100 Mbps', speed: '100/100 Mbps', price: 1025, type: 'Fibre', description: 'Telkom Business Fibre package with 100/100 Mbps speed.' },
  { id: 'p31', name: 'Telkom Business Core/Stream 200/100 Mbps', speed: '200/100 Mbps', price: 1299, type: 'Fibre', description: 'Telkom Business Fibre package with 200/100 Mbps speed.' },
  { id: 'p32', name: 'Telkom Business Core/Stream 200/200 Mbps', speed: '200/200 Mbps', price: 1365, type: 'Fibre', description: 'Telkom Business Fibre package with 200/200 Mbps speed.' },
  { id: 'p33', name: 'Telkom Business Core/Stream 300/150 Mbps', speed: '300/150 Mbps', price: 1529, type: 'Fibre', description: 'Telkom Business Fibre package with 300/150 Mbps speed.' },
  { id: 'p34', name: 'Telkom Business Core/Stream 500/250 Mbps', speed: '500/250 Mbps', price: 1699, type: 'Fibre', popular: true, description: 'Telkom Business Fibre package with 500/250 Mbps speed.' },
  { id: 'p35', name: 'Telkom Business Custom Fibre', speed: 'Custom', price: 0, type: 'Fibre', description: 'Enter custom Telkom Business Fibre configuration.' },

  // --- Telkom Business Voice Packages ---
  { id: 'p36', name: 'Telkom Business Smart Voice Basic', speed: 'Voice Line', price: 239, type: 'LTE', description: 'Telkom Business Smart Voice Basic plan.' },
  { id: 'p37', name: 'Telkom Business Smart Voice 100', speed: 'Voice Line', price: 345, type: 'LTE', description: 'Telkom Business Smart Voice 100 minutes plan.' },
  { id: 'p38', name: 'Telkom Business Smart Voice 300', speed: 'Voice Line', price: 469, type: 'LTE', description: 'Telkom Business Smart Voice 300 minutes plan.' },
  { id: 'p39', name: 'Telkom Business Smart Voice 500', speed: 'Voice Line', price: 549, type: 'LTE', description: 'Telkom Business Smart Voice 500 minutes plan.' },
  { id: 'p40', name: 'Telkom Business Smart Voice Unlimited', speed: 'Voice Line', price: 705, type: 'LTE', popular: true, description: 'Telkom Business Smart Voice Unlimited plan.' },
  { id: 'p41', name: 'Telkom Business Custom Voice', speed: 'Voice Line', price: 0, type: 'LTE', description: 'Enter custom Telkom Business Voice option.' },

  // --- Telkom Business PABX Options ---
  { id: 'p42', name: 'Telkom Business PABX Outright Purchase', speed: 'PABX System', price: 0, type: 'Mesh Wi-Fi', description: 'Outright purchase option calculated at 5% rate.' },
  { id: 'p43', name: 'Telkom Business PABX Rental @ TVC', speed: 'PABX System', price: 0, type: 'Mesh Wi-Fi', description: 'Rental option calculated at 5% rate.' }
];

export default function ECommerce() {
  const [darkMode, setDarkMode] = useState(false);

  // Dynamic Theme Setup configured for white background and black text
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2563eb', // Indigo Blue
      },
      secondary: {
        main: '#38bdf8', // Sky Blue
      },
      background: {
        default: '#ffffff',
        paper: '#ffffff',
      },
      text: {
        primary: '#000000',
        secondary: '#333333',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
    shape: {
      borderRadius: 16,
    },
  });

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  
  // State variables
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [bill, setBill] = useState<Bill>({
    id: 'INV-2026-8802',
    accountNo: 'TCH-99482-ZA',
    month: 'July 2026',
    amount: 699.00,
    dueDate: '2026-07-25',
    status: 'Unpaid'
  });
  const [payingBill, setPayingBill] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // --- NEW FEATURES STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); 
  const [coveragePostal, setCoveragePostal] = useState('');
  const [coverageStatus, setCoverageStatus] = useState<string | null>(null);
  const [uptimePct, setUptimePct] = useState(99.98);
  const [isSpeedTesting, setIsSpeedTesting] = useState(false);
  const [speedVal, setSpeedVal] = useState(0);
  const [houseSize, setHouseSize] = useState<number>(100);
  const [neededPods, setNeededPods] = useState<number>(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([
    { sender: 'bot', text: 'Hi! I am the Connection Hub Assistant. Ask me about our Fibres, Coverage, or payments!' }
  ]);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const triggerToast = (message: string, severity: 'success' | 'info' | 'error' = 'info') => {
    setToast({ open: true, message, severity });
  };

  // --- REAL-TIME FIREBASE SIDE-EFFECTS ---
  useEffect(() => {
    const dbRef = ref(db, 'systemSettings');
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.uptime) setUptimePct(data.uptime);
      } else {
        set(ref(db, 'systemSettings'), { uptime: 99.99, systemLive: true });
      }
    });
  }, []);

  // Sync Cart contents to RTDB when updated
  useEffect(() => {
    if (cart.length > 0) {
      set(ref(db, 'visitorSessions/guest_user/cart'), cart);
    }
  }, [cart]);

  // --- ACTIONS ---
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    triggerToast(`${product.name} added to cart!`, 'success');
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    triggerToast('Item removed from cart', 'info');
  };

  const updateQuantity = (id: string, amount: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + amount;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // Calculators
  const subTotalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = subTotalAmount * (appliedDiscount / 100);
  const totalCartAmount = subTotalAmount - discountAmount;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsCheckoutSuccess(true);
    setTimeout(() => {
      const newReceipt: PaymentReceipt = {
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split('T')[0],
        accountNo: 'TCH-GUEST-CHECKOUT',
        amountPaid: totalCartAmount,
        paymentMethod: 'Credit/Debit Card',
        description: `Purchase: ${cart.map(c => `${c.name} (x${c.quantity})`).join(', ')}`
      };

      const salesRef = ref(db, 'salesLogs');
      const newSaleRef = push(salesRef);
      set(newSaleRef, {
        ...newReceipt,
        items: cart,
        timestamp: new Date().toISOString()
      });

      setPaymentReceipt(newReceipt);
      setCart([]);
      setIsCheckoutSuccess(false);
      setIsCartOpen(false);
      setAppliedDiscount(0);
      setPromoCode('');
      triggerToast('Order placed successfully!', 'success');
    }, 2000);
  };

  const handlePayBill = (e: React.FormEvent) => {
    e.preventDefault();
    setPayingBill(true);
    
    setTimeout(() => {
      const updatedBill: Bill = { ...bill, status: 'Paid' };
      update(ref(db, 'billing/TCH-99482-ZA'), { status: 'Paid' });
      setBill(updatedBill);
      setPayingBill(false);
      
      const newReceipt: PaymentReceipt = {
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split('T')[0],
        accountNo: bill.accountNo,
        amountPaid: bill.amount,
        paymentMethod: 'Credit/Debit Card',
        description: `Contract payment for invoice ${bill.month}`
      };

      const ledgerRef = ref(db, 'ledgerLogs');
      const logPush = push(ledgerRef);
      set(logPush, {
        ...newReceipt,
        timestamp: new Date().toISOString()
      });

      setPaymentReceipt(newReceipt);
      triggerToast('Contract Invoice Settled!', 'success');
    }, 2000);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'SPEED10') {
      setAppliedDiscount(10);
      triggerToast('10% Discount Applied!', 'success');
    } else {
      triggerToast('Invalid Coupon Code', 'error');
    }
  };

  const handleCoverageCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const postal = parseInt(coveragePostal);
    if (!postal || isNaN(postal)) {
      setCoverageStatus("Please enter a valid postal code");
      return;
    }
    if (postal >= 1000 && postal <= 3000) {
      setCoverageStatus("⚡ Green Zone: Ultra Gigabit Fibre & LTE ready in your area!");
    } else if (postal > 3000 && postal < 8000) {
      setCoverageStatus("📶 Medium Zone: Fast LTE Network & Mesh solutions supported.");
    } else {
      setCoverageStatus("⚠️ Setup required: Coverage limits exist. Contact our support team below.");
    }
  };

  const runSpeedTest = () => {
    setIsSpeedTesting(true);
    setSpeedVal(0);
    const interval = setInterval(() => {
      setSpeedVal(prev => {
        if (prev >= 450) {
          clearInterval(interval);
          setIsSpeedTesting(false);
          triggerToast('Speed test finished!', 'success');
          return 498.4;
        }
        return prev + Math.floor(Math.random() * 60) + 10;
      });
    }, 150);
  };

  const calculatePods = (sizeVal: number) => {
    setHouseSize(sizeVal);
    if (sizeVal <= 100) setNeededPods(1);
    else if (sizeVal <= 250) setNeededPods(2);
    else setNeededPods(3);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = "Our technical crew is looking into that. Would you like us to schedule a callback?";
      const lower = userMsg.toLowerCase();

      if (lower.includes('fibre') || lower.includes('speed')) {
        botResponse = "We feature Uncapped Gigabit Fibre and Premium Mesh hardware, with rates starting from just R 399/pm!";
      } else if (lower.includes('pay') || lower.includes('contract')) {
        botResponse = "To process updates or pay billing modules instantly, access the 'Pay My Contract' tab above.";
      } else if (lower.includes('promo') || lower.includes('discount')) {
        botResponse = "Try checking out with promo code SPEED10 to grab 10% off physical store bundles today!";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  const downloadReceipt = () => {
    if (!paymentReceipt) return;
    const receiptText = `
=========================================
      THE CONNECTION HUB PAYMENT PROOF   
=========================================
Transaction ID: ${paymentReceipt.transactionId}
Payment Date:   ${paymentReceipt.date}
Account No:     ${paymentReceipt.accountNo}
Amount Settled: R ${paymentReceipt.amountPaid.toFixed(2)}
Payment Method: ${paymentReceipt.paymentMethod}
Details:        ${paymentReceipt.description}

Thank you for choosing Connection Hub!
Keep this for records. Connectivity is Life.
=========================================
    `;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TCH_Receipt_${paymentReceipt.transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = PRODUCTS.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || prod.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', position: 'relative', pb: 10, bgcolor: 'background.default', color: 'text.primary' }}>
        
        {/* --- GLOBAL TOAST SYSTEM --- */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={toast.severity} onClose={() => setToast(prev => ({ ...prev, open: false }))} variant="filled" sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>

        {/* --- HEADER NAVBAR --- */}
        <AppBar position="sticky" color="inherit" elevation={1} sx={{ backdropFilter: 'blur(12px)', backgroundColor: '#ffffff', borderBottom: 1, borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ height: 80, display: 'flex', justifyContent: 'space-between' }}>
              
              {/* Brand Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ background: 'linear-gradient(135deg, #2563eb, #38bdf8)', p: 1, borderRadius: 3, display: 'flex' }}>
                  <WifiIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(90deg, #2563eb, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    The Connection Hub
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '2px', display: 'block', textTransform: 'uppercase', fontSize: '9px' }}>
                    Premium Fibre & Wi-Fi
                  </Typography>
                </Box>
              </Box>

              {/* Navigation Tabs (Desktop) */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: '#f8fafc', border: 1, borderColor: 'divider', borderRadius: 4, p: 0.5 }}>
                <Tabs value={activeTab} onChange={(_, val) => { setActiveTab(val); setPaymentReceipt(null); }} indicatorColor="primary" textColor="primary">
                  <Tab label="Internet Store" sx={{ fontWeight: 'bold', fontSize: '13px', color: '#000000' }} />
                  <Tab label="Pay My Contract" sx={{ fontWeight: 'bold', fontSize: '13px', color: '#000000' }} />
                  <Tab label="Interactive Hub" sx={{ fontWeight: 'bold', fontSize: '13px', color: '#000000' }} />
                </Tabs>
              </Box>

              {/* Theme & Drawer Control Handles */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton onClick={() => setDarkMode(!darkMode)} color="primary" sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 1.2 }}>
                  {darkMode ? <SunIcon /> : <MoonIcon />}
                </IconButton>
                <IconButton onClick={() => setIsCartOpen(true)} color="primary" sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 1.2 }}>
                  <Badge badgeContent={cart.reduce((sum, item) => sum + item.quantity, 0)} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Box>

            </Toolbar>
          </Container>
        </AppBar>

        {/* Mobile Navigation fallback */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, py: 1.5, bgcolor: '#ffffff', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, val) => { setActiveTab(val); setPaymentReceipt(null); }} centered>
            <Tab label="Store" sx={{ fontWeight: 'bold', fontSize: '11px', color: '#000000' }} />
            <Tab label="Contracts" sx={{ fontWeight: 'bold', fontSize: '11px', color: '#000000' }} />
            <Tab label="Interactive" sx={{ fontWeight: 'bold', fontSize: '11px', color: '#000000' }} />
          </Tabs>
        </Box>

        {/* --- UPTIME INDICATOR --- */}
        <Box sx={{ bgcolor: '#f8fafc', py: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#10b981', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ color: '#000000', fontWeight: 500 }}>
            All systems online: <Box component="span" sx={{ color: '#10b981', fontWeight: 800 }}>{uptimePct}% Uptime</Box>
          </Typography>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 5 }}>
          
          {/* --- TAB 1: E-COMMERCE PRODUCTS --- */}
          {activeTab === 0 && (
            <Box>
              {/* Premium Hero Section */}
              <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, position: 'relative', overflow: 'hidden', mb: 5, background: '#f8fafc', border: 1, borderColor: 'divider' }}>
                <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
                  <Chip icon={<SparklesIcon style={{ color: '#2563eb' }} />} label="High-Speed Broadband Unlocked" size="small" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 'bold' }} />

                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#000000', mb: 2 }}>
                    Experience Speed Without Boundaries
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333333', mb: 3, lineHeight: 1.6 }}>
                    Join South Africa's premium fibre framework. The Connection Hub pairs state-of-the-art speeds with enterprise-level uptime. Free standard setup is included on all options.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Chip icon={<ShieldIcon style={{ color: '#10b981' }} />} label="No FUP Throttle" variant="filled" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} />
                    <Chip icon={<ZapIcon style={{ color: '#f59e0b' }} />} label="Next-Day Setup" variant="filled" sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }} />
                  </Box>
                </Box>
              </Paper>

              {/* Filter controls */}
              <Paper sx={{ p: 2, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', borderRadius: 4, border: 1, borderColor: 'divider' }}>
                <TextField 
                  fullWidth
                  placeholder="Search products, speed plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="outlined"
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      )
                    }
                  }}
                />

                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', width: { xs: '100%', md: 'auto' } }}>
                  {['All', 'Fibre', 'LTE', 'Mesh Wi-Fi'].map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedType === cat ? 'contained' : 'outlined'}
                      onClick={() => setSelectedType(cat)}
                      sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                    >
                      {cat}
                    </Button>
                  ))}
                </Box>
              </Paper>

              {/* Products Grid */}
              <Grid container spacing={4}>
                {filteredProducts.map((prod) => (
                  <Grid item xs={12} sm={6} md={4} key={prod.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: prod.popular ? 2 : 1, borderColor: prod.popular ? 'primary.main' : 'divider', position: 'relative', overflow: 'visible', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }, bgcolor: '#ffffff' }}>
                      {prod.popular && (
                        <Chip label="POPULAR CHOICE" color="primary" sx={{ position: 'absolute', top: -14, left: 20, fontWeight: 'extrabold', fontSize: '10px' }} />
                      )}
                      <CardContent sx={{ pt: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Chip label={prod.type} size="small" variant="outlined" color="primary" />
                          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            {prod.speed}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#000000' }}>
                          {prod.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#333333' }}>
                          {prod.description}
                        </Typography>
                      </CardContent>
                      <Box>
                        <Divider />
                        <CardActions sx={{ p: 2.5, flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#333333' }}>Monthly Cost</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#000000' }}>R {prod.price} <Box component="span" sx={{ fontSize: '12px', fontWeight: 'normal', color: '#333333' }}>/pm</Box></Typography>
                          </Box>

                          <Button 
                            fullWidth 
                            variant={prod.popular ? 'contained' : 'outlined'} 
                            startIcon={<ShoppingCartIcon />}
                            onClick={() => addToCart(prod)}
                            sx={{ borderRadius: 3, py: 1.2, fontWeight: 'bold' }}
                          >
                            Add to Connection Cart
                          </Button>
                        </CardActions>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* --- TAB 2: PAY MY CONTRACT --- */}
          {activeTab === 1 && (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 1, color: '#000000' }}>
                Contract Payments Portal
              </Typography>
              <Typography variant="body2" align="center" sx={{ mb: 5, color: '#333333' }}>
                Settle monthly Wi-Fi and fiber line contracts instantly via our secure pay-hub.
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 1, borderColor: 'divider', bgcolor: '#ffffff' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main' }}>Account Profile</Typography>
                        <Chip label={bill.status} color={bill.status === 'Paid' ? 'success' : 'error'} size="small" />
                      </Box>

                      <List dense disablePadding>
                        <ListItem sx={{ px: 0, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                          <ListItemText 
                            primary="Account ID" 
                            secondary={bill.accountNo} 
                            primaryTypographyProps={{ style: { color: '#000000' } }} 
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                          <ListItemText 
                            primary="Invoice Cycle" 
                            secondary={bill.month} 
                            primaryTypographyProps={{ style: { color: '#000000' } }} 
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                          <ListItemText 
                            primary="Due Date" 
                            secondary={bill.dueDate} 
                            primaryTypographyProps={{ style: { color: '#000000' } }} 
                          />
                        </ListItem>
                      </List>
                    </Box>

                    <Paper sx={{ p: 2, mt: 3, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" sx={{ color: '#333333' }}>Unsettled Charge:</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#000000' }}>R {bill.amount.toFixed(2)}</Typography>
                    </Paper>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, border: 1, borderColor: 'divider', bgcolor: '#ffffff' }}>
                    {bill.status === 'Paid' ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000000' }}>Invoice Settled</Typography>
                        <Typography variant="body2" sx={{ mb: 3, color: '#333333' }}>Thank you! Your gateway parameters are active and up to date.</Typography>
                        {paymentReceipt && (
                          <Button startIcon={<DownloadIcon />} variant="text" onClick={downloadReceipt}>
                            Download Payment Proof
                          </Button>
                        )}
                      </Box>
                    ) : (
                      <Box component="form" onSubmit={handlePayBill}>
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', mb: 3, color: '#000000' }}>
                          <CreditCardIcon color="primary" /> Safe Pay-Gate
                        </Typography>

                        <TextField
                          fullWidth
                          label="Debit / Credit Card Number"
                          placeholder="•••• •••• •••• ••••"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          sx={{ mb: 2 }}
                        />

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Expiry Date"
                              placeholder="MM/YY"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="CVC / CVV"
                              type="password"
                              placeholder="•••"
                              required
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                            />
                          </Grid>
                        </Grid>

                        <Button type="submit" fullWidth variant="contained" disabled={payingBill} sx={{ py: 1.5, fontWeight: 'bold' }}>
                          {payingBill ? 'Validating Token...' : `Settle R ${bill.amount.toFixed(2)}`}
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* --- TAB 3: INTERACTIVE HUB TOOLS --- */}
          {activeTab === 2 && (
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              {/* Speed Tester Component */}
              <Paper sx={{ p: 4, mb: 4, border: 1, borderColor: 'divider', bgcolor: '#ffffff', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                <Box sx={{ maxWidth: 400 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold', mb: 1, textTransform: 'uppercase' }}>
                    <GaugeIcon /> Real-time Speed Test
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#000000' }}>Test Your Connectivity Parameters</Typography>
                  <Typography variant="body2" sx={{ color: '#333333' }}>Run safe, instant latency analyses against our premium server arrays locally.</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 140, height: 140, borderRadius: '50%', border: '4px dashed', borderColor: 'divider', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fafc' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#000000' }}>{speedVal}</Typography>
                    <Typography variant="caption" sx={{ color: '#333333' }}>Mbps</Typography>
                  </Box>
                  <Button variant="contained" disabled={isSpeedTesting} onClick={runSpeedTest} sx={{ borderRadius: 3, fontWeight: 'bold' }}>
                    {isSpeedTesting ? 'Running Audit...' : 'Initiate Scan'}
                  </Button>
                </Box>
              </Paper>

              <Grid container spacing={4}>
                {/* Coverage Map Component */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 1, borderColor: 'divider', bgcolor: '#ffffff' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold', mb: 1, textTransform: 'uppercase' }}>
                        <MapPinIcon /> Signal & Coverage Lookup
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#000000' }}>Is The Hub ready in your region?</Typography>
                      <Typography variant="body2" sx={{ mb: 3, color: '#333333' }}>Enter your postal code check-box below to verify network metrics.</Typography>
                      
                      <Box component="form" onSubmit={handleCoverageCheck} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          placeholder="e.g. 2000, 7530"
                          value={coveragePostal}
                          onChange={(e) => setCoveragePostal(e.target.value)}
                          slotProps={{ htmlInput: { maxLength: 4 } }}
                        />
                        <Button type="submit" variant="contained" sx={{ fontWeight: 'bold' }}>Check</Button>
                      </Box>
                    </Box>
                    {coverageStatus && (
                      <Paper sx={{ p: 2, mt: 3, bgcolor: '#f8fafc', border: 1, borderColor: 'divider' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000000' }}>{coverageStatus}</Typography>
                      </Paper>
                    )}
                  </Paper>
                </Grid>

                {/* Mesh Extender Calculator */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, height: '100%', border: 1, borderColor: 'divider', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold', mb: 1, textTransform: 'uppercase' }}>
                        <HomeIcon /> Wi-Fi Mesh Planner
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#000000' }}>Configure mesh system pods</Typography>
                      <Typography variant="body2" sx={{ mb: 3, color: '#333333' }}>Drag the slider parameters below to calculate optimal hardware nodes.</Typography>

                      <Box sx={{ px: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#000000' }}>House Footprint Size</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{houseSize} m²</Typography>
                        </Box>
                        <Slider
                          min={40}
                          max={400}
                          value={houseSize}
                          onChange={(_, val) => calculatePods(val as number)}
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    </Box>

                    <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white', textAlign: 'center', mt: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Recommended Deco Pods: <Box component="span" sx={{ fontSize: '18px', fontWeight: 900 }}>{neededPods}</Box>
                      </Typography>
                    </Paper>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

        </Container>

        {/* --- FLOATING LIVE SUPPORT CHAT --- */}
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
          {chatOpen ? (
            <Paper sx={{ width: 320, height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 1, borderColor: 'divider', boxShadow: 6, bgcolor: '#ffffff' }}>

              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: '#10b981', borderRadius: '50%' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Hub Live Support</Typography>
                </Box>
                <IconButton size="small" onClick={() => setChatOpen(false)} sx={{ color: 'white' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 280 }}>
                {chatMessages.map((m, idx) => (
                  <Box key={idx} sx={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <Paper sx={{ p: 1.5, bgcolor: m.sender === 'user' ? 'primary.main' : '#f8fafc', color: m.sender === 'user' ? 'white' : '#000000', borderRadius: 2, border: m.sender === 'bot' ? 1 : 0, borderColor: 'divider' }}>
                      <Typography variant="body2" sx={{ fontSize: '12px' }}>{m.text}</Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>

              <Box component="form" onSubmit={handleSendMessage} sx={{ p: 1.5, display: 'flex', gap: 1, borderTop: 1, borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask your query..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <IconButton type="submit" color="primary">
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            </Paper>
          ) : (
            <Button variant="contained" color="primary" onClick={() => setChatOpen(true)} sx={{ borderRadius: '50%', minWidth: 60, height: 60, boxShadow: 4 }}>
              <MessageSquareIcon />
            </Button>
          )}
        </Box>

        {/* --- SHOPPING CART DRAWER --- */}
        <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)}>
          <Box sx={{ width: { xs: '100vw', sm: 400 }, p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: '#ffffff' }}>
            <Box sx={{ overflowY: 'auto' }}>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: '#000000' }}>
                  <ShoppingCartIcon color="primary" /> My Hub Cart
                </Typography>
                <IconButton onClick={() => setIsCartOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {cart.length === 0 ? (
                <Typography variant="body2" align="center" sx={{ py: 6, color: '#333333' }}>
                  Your Connection Cart is empty. Select high-speed options in our store.
                </Typography>
              ) : (
                <List disablePadding>
                  {cart.map((item) => (
                    <Paper key={item.id} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider', bgcolor: '#ffffff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#000000' }}>{item.name}</Typography>
                          <Typography variant="caption" color="primary">{item.speed}</Typography>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000000' }}>R {item.price * item.quantity}</Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                          <Button size="small" sx={{ minWidth: 24, p: 0 }} onClick={() => updateQuantity(item.id, -1)}>-</Button>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000000' }}>{item.quantity}</Typography>
                          <Button size="small" sx={{ minWidth: 24, p: 0 }} onClick={() => updateQuantity(item.id, 1)}>+</Button>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </List>
              )}
            </Box>

            {cart.length > 0 && (
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
                <Box component="form" onSubmit={handleApplyPromo} sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="SPEED10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button type="submit" variant="outlined" sx={{ fontWeight: 'bold' }}>Apply</Button>
                </Box>

                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#333333' }}>Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000000' }}>R {subTotalAmount.toFixed(2)}</Typography>
                  </Box>
                  {appliedDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="success.main">Discount ({appliedDiscount}%):</Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>- R {discountAmount.toFixed(2)}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#000000' }}>Total Bill:</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'black', color: 'primary.main' }}>R {totalCartAmount.toFixed(2)}</Typography>
                  </Box>
                </Box>

                {isCheckoutSuccess && <LinearProgress sx={{ mb: 2 }} />}

                <Button fullWidth variant="contained" onClick={handleCheckout} disabled={isCheckoutSuccess} sx={{ py: 1.5, fontWeight: 'bold' }}>
                  {isCheckoutSuccess ? 'Processing Setup...' : `Checkout (R ${totalCartAmount.toFixed(2)})`}
                </Button>
              </Box>
            )}
          </Box>
        </Drawer>

      </Box>
    </ThemeProvider>
  );
}