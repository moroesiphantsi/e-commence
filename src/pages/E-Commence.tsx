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
  Divider, 
  Slider, 
  Chip, 
  Paper, 
  Alert, 
  Snackbar,
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Avatar,
  Checkbox
} from '@mui/material';

// --- MUI ICONS ---
import WifiIcon from '@mui/icons-material/Wifi';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HistoryIcon from '@mui/icons-material/History';
import CreditCardIcon from '@mui/icons-material/CreditCard';

// --- FIREBASE IMPORT ---
import { db } from '../firebase'; 
import { ref, onValue, set, push } from 'firebase/database';

// --- TYPES & INTERFACES ---
interface Product {
  id: string;
  name: string;
  speed: string;
  price: number;
  type: 'Fibre' | 'LTE' | 'PABX';
  popular?: boolean;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface PaymentReceipt {
  transactionId: string;
  date: string;
  accountNo: string;
  amountPaid: number;
  paymentMethod: string;
  description: string;
  customerName?: string;
  serviceAddress?: string;
}

const DEFAULT_PRODUCTS: Product[] = [
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
  { id: 'p10', name: 'Telkom FTTH Core/Stream 200/200 Mbps', speed: '200/200 Mbps', price: 1365, type: 'Fibre', description: 'Telkom FTTH Core/Stream package.' },
  { id: 'p11', name: 'Telkom FTTH Core/Stream 300/150 Mbps', speed: '300/150 Mbps', price: 1529, type: 'Fibre', description: 'Telkom FTTH Postpaid package offering 300/150 Mbps connectivity.' },
  { id: 'p12', name: 'Telkom FTTH Core/Stream 500/250 Mbps', speed: '500/250 Mbps', price: 1699, type: 'Fibre', popular: true, description: 'Telkom FTTH Postpaid package offering 500/250 Mbps connectivity.' },

  // --- Telkom LTE ---
  { id: 'p14', name: 'Telkom LTE 10 Mbps Unlimited', speed: '10 Mbps', price: 299, type: 'LTE', description: 'Telkom LTE package with unlimited data at 10 Mbps speed.' },
  { id: 'p15', name: 'Telkom LTE 20 Mbps Unlimited', speed: '20 Mbps', price: 449, type: 'LTE', description: 'Telkom LTE package with unlimited data at 20 Mbps speed.' },
  { id: 'p16', name: 'Telkom LTE 30 Mbps Unlimited', speed: '30 Mbps', price: 599, type: 'LTE', popular: true, description: 'Telkom LTE package with unlimited data at 30 Mbps speed.' },
  { id: 'p17', name: 'Telkom LTE 2TB Data', speed: 'Unthrottled', price: 699, type: 'LTE', description: 'Telkom LTE package providing 2TB high-speed monthly data.' }
];

export default function ECommerce() {
  const [darkMode, setDarkMode] = useState(false);

  // Dynamic Theme Setup
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2563eb',
      },
      secondary: {
        main: '#38bdf8',
      },
      background: {
        default: darkMode ? '#0f172a' : '#ffffff',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#f8fafc' : '#000000',
        secondary: darkMode ? '#cbd5e1' : '#333333',
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
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [, setPaymentReceipt] = useState<PaymentReceipt | null>(null);

  // --- PAY MY CONTRACT PORTAL STATES ---
  const [customerType, setCustomerType] = useState<'yes' | 'no'>('yes');
  
  // Login & Registration States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Service Address State
  const [addressType, setAddressType] = useState('Free Standing House');
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [suburb, setSuburb] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Delivery Address State
  const [isNewDeliveryAddress, setIsNewDeliveryAddress] = useState<boolean>(false);
  const [delStreetNumber, setDelStreetNumber] = useState('');
  const [delStreetName, setDelStreetName] = useState('');
  const [delSuburb, setDelSuburb] = useState('');
  const [delCity, setDelCity] = useState('');
  const [delProvince, setDelProvince] = useState('');
  const [delPostalCode, setDelPostalCode] = useState('');

  // Payment Details State
  const [paymentMethod, setPaymentMethod] = useState<'Debit Order' | 'Credit/Debit Card' | 'EFT'>('Credit/Debit Card');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [bankName, setBankName] = useState('');
  const [branchCode, setBranchCode] = useState('');

  // Additional Information & Ts and Cs
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = useState<any | null>(null);

  // --- GENERAL APP STATES ---
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
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([]);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const triggerToast = (message: string, severity: 'success' | 'info' | 'error' = 'info') => {
    setToast({ open: true, message, severity });
  };

  // -------------------------------------------------------------
  // REAL-TIME FIREBASE SYNCHRONIZATION LISTENERS
  // -------------------------------------------------------------

  // 1. Fetch & Sync Products Realtime Database Catalog
  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setProducts(Array.isArray(data) ? data : Object.values(data));
      } else {
        // Initialize Firebase with defaults if empty
        set(productsRef, DEFAULT_PRODUCTS);
        setProducts(DEFAULT_PRODUCTS);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time System Uptime & Settings
  useEffect(() => {
    const dbRef = ref(db, 'systemSettings');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.uptime) setUptimePct(data.uptime);
      } else {
        set(ref(db, 'systemSettings'), { uptime: 99.99, systemLive: true });
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Real-time User Cart Sync
  useEffect(() => {
    const cartRef = ref(db, 'visitorSessions/guest_user/cart');
    const unsubscribe = onValue(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        setCart(snapshot.val());
      }
    });
    return () => unsubscribe();
  }, []);

  // 4. Real-time User Auth State Sync
  useEffect(() => {
    const userRef = ref(db, 'visitorSessions/guest_user/loggedInUser');
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        setLoggedInUser(user);
        setIsLoggedIn(true);
        if (user.name) setAccountHolderName(user.name);
      } else {
        setLoggedInUser(null);
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 5. Real-time Chat Messages Sync
  useEffect(() => {
    const chatRef = ref(db, 'supportChats/guest_user/messages');
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setChatMessages(Array.isArray(val) ? val : Object.values(val));
      } else {
        const defaultMsg = [
          { sender: 'bot' as const, text: 'Hi! I am the Connection Hub Assistant. Ask me about our Fibres, Coverage, or payments!' }
        ];
        set(chatRef, defaultMsg);
      }
    });
    return () => unsubscribe();
  }, []);

  // -------------------------------------------------------------
  // HANDLERS WITH REALTIME DATABASE WRITES
  // -------------------------------------------------------------

  // Save Cart state to Firebase
  const saveCartToDb = (newCart: CartItem[]) => {
    setCart(newCart);
    set(ref(db, 'visitorSessions/guest_user/cart'), newCart);
  };

  // Auth Handlers with Realtime DB Write
  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      triggerToast('Please enter your email and password.', 'error');
      return;
    }
    const derivedName = loginEmail.split('@')[0].toUpperCase();
    const userObj = { name: derivedName, email: loginEmail, loggedInAt: new Date().toISOString() };
    
    set(ref(db, 'visitorSessions/guest_user/loggedInUser'), userObj);
    setAccountHolderName(derivedName);
    triggerToast(`Welcome back, ${derivedName}! Account verified.`, 'success');
  };

  const handleUserRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      triggerToast('Please fill in all registration fields.', 'error');
      return;
    }
    const userObj = { 
      name: registerName, 
      email: registerEmail, 
      phone: registerPhone,
      registeredAt: new Date().toISOString() 
    };

    set(ref(db, 'users/' + registerPhone), userObj);
    set(ref(db, 'visitorSessions/guest_user/loggedInUser'), { name: registerName, email: registerEmail });
    setAccountHolderName(registerName);
    triggerToast('Account created successfully! You can now complete your order.', 'success');
  };

  const handleUserLogout = () => {
    set(ref(db, 'visitorSessions/guest_user/loggedInUser'), null);
    setLoginPassword('');
    triggerToast('Logged out successfully.', 'info');
  };

  // Cart Management
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    saveCartToDb(updatedCart);
    triggerToast(`${product.name} added to cart!`, 'success');
  };

  const removeFromCart = (id: string) => {
    const updatedCart = cart.filter(item => item.id !== id);
    saveCartToDb(updatedCart);
    triggerToast('Item removed from cart', 'info');
  };

  const updateQuantity = (id: string, amount: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + amount;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    });
    saveCartToDb(updatedCart);
  };

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
      saveCartToDb([]);
      setIsCheckoutSuccess(false);
      setIsCartOpen(false);
      setAppliedDiscount(0);
      setPromoCode('');
      triggerToast('Order placed successfully!', 'success');
    }, 2000);
  };

  // Contract Flow Submit Handler
  const handleCompleteContractOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      triggerToast('Please accept terms and conditions to proceed', 'error');
      return;
    }

    setIsSubmittingOrder(true);
    
    setTimeout(() => {
      const fullServiceAddress = `${streetNumber} ${streetName}, ${suburb}, ${city}, ${province}, ${postalCode} (${addressType})`;
      const fullDeliveryAddress = isNewDeliveryAddress 
        ? `${delStreetNumber} ${delStreetName}, ${delSuburb}, ${delCity}, ${delProvince}, ${delPostalCode}`
        : fullServiceAddress;
      
      const accountNoGenerated = `TCH-${Math.floor(100000 + Math.random() * 900000)}`;
      const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderPayload = {
        transactionId: txnId,
        accountNo: accountNoGenerated,
        date: new Date().toISOString().split('T')[0],
        customerName: loggedInUser ? loggedInUser.name : (customerType === 'yes' ? loginEmail : registerName),
        customerEmail: loggedInUser ? loggedInUser.email : (customerType === 'yes' ? loginEmail : registerEmail),
        customerPhone: registerPhone || 'N/A',
        serviceAddress: fullServiceAddress,
        deliveryAddress: fullDeliveryAddress,
        paymentMethod: paymentMethod,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        accountType: accountType,
        bankName: bankName,
        branchCode: branchCode,
        additionalNotes: additionalNotes,
        amountPaid: 699.00,
        status: 'Order & Payment Confirmed'
      };

      // Push Contract Order
      const contractRef = ref(db, 'contractOrders');
      const newContractPush = push(contractRef);
      set(newContractPush, {
        ...orderPayload,
        timestamp: new Date().toISOString()
      });

      // Save user service/delivery address and payment configuration for future sessions
      set(ref(db, 'visitorSessions/guest_user/addressDetails'), {
        serviceAddress: fullServiceAddress,
        deliveryAddress: fullDeliveryAddress
      });
      set(ref(db, 'visitorSessions/guest_user/paymentDetails'), {
        paymentMethod,
        accountHolderName,
        bankName,
        branchCode
      });

      setConfirmedOrderData(orderPayload);
      setIsSubmittingOrder(false);
      triggerToast('Contract Order Completed Successfully!', 'success');
    }, 2000);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'SPEED10') {
      setAppliedDiscount(10);
      set(ref(db, 'visitorSessions/guest_user/appliedDiscount'), 10);
      triggerToast('10% Discount Applied!', 'success');
    } else {
      triggerToast('Invalid Coupon Code', 'error');
    }
  };

  const handleCoverageCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const postal = parseInt(coveragePostal);
    let statusText = '';
    if (!postal || isNaN(postal)) {
      statusText = "Please enter a valid postal code";
      setCoverageStatus(statusText);
      return;
    }
    if (postal >= 1000 && postal <= 3000) {
      statusText = "⚡ Green Zone: Ultra Gigabit Fibre & LTE ready in your area!";
    } else if (postal > 3000 && postal < 8000) {
      statusText = "📶 Medium Zone: Fast LTE Network & Mesh solutions supported.";
    } else {
      statusText = "⚠️ Setup required: Coverage limits exist. Contact our support team below.";
    }
    setCoverageStatus(statusText);

    // Persist lookup to Firebase
    push(ref(db, 'interactiveLogs/coverageChecks'), {
      postalCode: coveragePostal,
      result: statusText,
      timestamp: new Date().toISOString()
    });
  };

  const runSpeedTest = () => {
    setIsSpeedTesting(true);
    setSpeedVal(0);
    const interval = setInterval(() => {
      setSpeedVal(prev => {
        if (prev >= 450) {
          clearInterval(interval);
          setIsSpeedTesting(false);
          const finalResult = 498.4;
          
          // Store result in database
          push(ref(db, 'interactiveLogs/speedTests'), {
            speedMbps: finalResult,
            timestamp: new Date().toISOString()
          });

          triggerToast('Speed test finished!', 'success');
          return finalResult;
        }
        return prev + Math.floor(Math.random() * 60) + 10;
      });
    }, 150);
  };

  const calculatePods = (sizeVal: number) => {
    setHouseSize(sizeVal);
    let pods = 1;
    if (sizeVal <= 100) pods = 1;
    else if (sizeVal <= 250) pods = 2;
    else pods = 3;
    
    setNeededPods(pods);
    set(ref(db, 'visitorSessions/guest_user/meshPlanner'), { houseSize: sizeVal, recommendedPods: pods });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const updatedMessages = [...chatMessages, { sender: 'user' as const, text: userMsg }];
    
    setChatMessages(updatedMessages);
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
      
      const newMessages = [...updatedMessages, { sender: 'bot' as const, text: botResponse }];
      setChatMessages(newMessages);
      
      // Update Firebase Live Chat log
      set(ref(db, 'supportChats/guest_user/messages'), newMessages);
    }, 1000);
  };

  const downloadContractReceipt = () => {
    if (!confirmedOrderData) return;
    const receiptText = `
=====================================================
      THE CONNECTION HUB - CONTRACT PROOF OF PAYMENT   
=====================================================
Order Ref ID:    ${confirmedOrderData.transactionId}
Account Number:  ${confirmedOrderData.accountNo}
Date:            ${confirmedOrderData.date}
Customer Name:   ${confirmedOrderData.customerName}
Customer Email:  ${confirmedOrderData.customerEmail}

--- SERVICE DETAILS ---
Service Address:  ${confirmedOrderData.serviceAddress}
Delivery Address: ${confirmedOrderData.deliveryAddress}

--- PAYMENT DETAILS ---
Payment Method:   ${confirmedOrderData.paymentMethod}
Account Holder:   ${confirmedOrderData.accountHolderName}
Account Number:   ${confirmedOrderData.accountNumber}
Account Type:     ${confirmedOrderData.accountType}
Bank/Branch:      ${confirmedOrderData.bankName} (${confirmedOrderData.branchCode})
Amount Paid:      R ${confirmedOrderData.amountPaid.toFixed(2)}
Status:           ${confirmedOrderData.status}

Additional Info:  ${confirmedOrderData.additionalNotes || 'N/A'}

Thank you for trusting The Connection Hub!
Keep this document as proof of setup and payment.
=====================================================
    `;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TCH_Contract_Proof_${confirmedOrderData.transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = (products.length > 0 ? products : DEFAULT_PRODUCTS).filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || prod.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', position: 'relative', pb: 10, bgcolor: 'background.default', color: 'text.primary' }}>
        
        {/* TOAST SYSTEM */}
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

        {/* HEADER NAVBAR */}
        <AppBar position="sticky" color="inherit" elevation={1} sx={{ backdropFilter: 'blur(12px)', backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderBottom: 1, borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ height: 80, display: 'flex', justifyContent: 'space-between' }}>
              
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

              <Box sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: darkMode ? '#0f172a' : '#f8fafc', border: 1, borderColor: 'divider', borderRadius: 4, p: 0.5 }}>
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} indicatorColor="primary" textColor="primary">
                  <Tab label="Internet Store" sx={{ fontWeight: 'bold', fontSize: '13px' }} />
                  <Tab label="Pay My Contract" sx={{ fontWeight: 'bold', fontSize: '13px' }} />
                  <Tab label="Interactive Hub" sx={{ fontWeight: 'bold', fontSize: '13px' }} />
                </Tabs>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isLoggedIn && loggedInUser && (
                  <Chip 
                    avatar={<Avatar>{loggedInUser.name.charAt(0)}</Avatar>}
                    label={loggedInUser.name}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'flex' } }}
                  />
                )}
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

        <Box sx={{ display: { xs: 'block', md: 'none' }, py: 1.5, bgcolor: darkMode ? '#1e293b' : '#ffffff', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} centered>
            <Tab label="Store" sx={{ fontWeight: 'bold', fontSize: '11px' }} />
            <Tab label="Contracts" sx={{ fontWeight: 'bold', fontSize: '11px' }} />
            <Tab label="Interactive" sx={{ fontWeight: 'bold', fontSize: '11px' }} />
          </Tabs>
        </Box>

        {/* UPTIME INDICATOR */}
        <Box sx={{ bgcolor: darkMode ? '#0f172a' : '#f8fafc', py: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#10b981', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            All systems online: <Box component="span" sx={{ color: '#10b981', fontWeight: 800 }}>{uptimePct}% Uptime</Box>
          </Typography>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 5 }}>
          
          {/* TAB 1: E-COMMERCE PRODUCTS */}
          {activeTab === 0 && (
            <Box>
              <Paper 
                sx={{ 
                  p: { xs: 4, md: 6 }, 
                  borderRadius: 6, 
                  position: 'relative', 
                  overflow: 'hidden', 
                  mb: 5, 
                  background: darkMode ? '#1e293b' : '#f8fafc', 
                  border: 1, 
                  borderColor: 'divider' 
                }}
              >
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Chip 
                        icon={<SparklesIcon style={{ color: '#2563eb' }} />} 
                        label="High-Speed Broadband Unlocked" 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mb: 2, fontWeight: 'bold' }} 
                      />

                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                        Experience Speed Without Boundaries
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'text.secondary' }}>
                        Join South Africa's premium fibre framework. The Connection Hub pairs state-of-the-art speeds with enterprise-level uptime. Free standard setup is included on all options.
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={<ShieldIcon style={{ color: '#10b981' }} />} 
                          label="No FUP Throttle" 
                          variant="filled" 
                          sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} 
                        />
                        <Chip 
                          icon={<ZapIcon style={{ color: '#f59e0b' }} />} 
                          label="Next-Day Setup" 
                          variant="filled" 
                          sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }} 
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 4, 
                        bgcolor: darkMode ? '#0f172a' : '#ffffff', 
                        border: 1, 
                        borderColor: 'divider',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold', mb: 0.5, textTransform: 'uppercase' }}>
                        <MapPinIcon /> Check Area Coverage
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Search your address before selecting a package:
                      </Typography>

                      <Box component="form" onSubmit={handleCoverageCheck} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Enter Postal Code or Address..."
                          value={coveragePostal}
                          onChange={(e) => setCoveragePostal(e.target.value)}
                        />
                        <Button type="submit" variant="contained" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          Check
                        </Button>
                      </Box>

                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: 180, 
                          borderRadius: 3, 
                          overflow: 'hidden', 
                          border: 1, 
                          borderColor: 'divider', 
                          bgcolor: '#f1f5f9' 
                        }}
                      >
                        <iframe
                          title="Openserve Coverage Map"
                          src="https://apps.openserve.co.za/gis/apps/api/samples/OpenServeFTTH-WMS.html"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                        />
                      </Box>

                      {coverageStatus && (
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: darkMode ? '#1e293b' : '#f8fafc', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                            {coverageStatus}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

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
                  {['All', 'Fibre', 'LTE', 'PABX'].map((cat) => (
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

              <Grid container spacing={4}>
                {filteredProducts.map((prod) => (
                  <Grid item xs={12} sm={6} md={4} key={prod.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: prod.popular ? 2 : 1, borderColor: prod.popular ? 'primary.main' : 'divider', position: 'relative', overflow: 'visible', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
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
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {prod.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {prod.description}
                        </Typography>
                      </CardContent>
                      <Box>
                        <Divider />
                        <CardActions sx={{ p: 2.5, flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Monthly Cost</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>R {prod.price} <Box component="span" sx={{ fontSize: '12px', fontWeight: 'normal', color: 'text.secondary' }}>/pm</Box></Typography>
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

          {/* TAB 2: PAY MY CONTRACT (AUTHENTICATION-GATED ORDER FLOW) */}
          {activeTab === 1 && (
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              
              {confirmedOrderData ? (
                /* ORDER CONFIRMATION VIEW */
                <Paper sx={{ p: { xs: 3, md: 5 }, border: 2, borderColor: 'success.main', borderRadius: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 72, mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      Order Confirmation
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      Thank you! Your contract order and payment process have been logged successfully.
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Account & Order Info</Typography>
                      <Typography variant="body2"><strong>Transaction Ref:</strong> {confirmedOrderData.transactionId}</Typography>
                      <Typography variant="body2"><strong>Account Number:</strong> {confirmedOrderData.accountNo}</Typography>
                      <Typography variant="body2"><strong>Date:</strong> {confirmedOrderData.date}</Typography>
                      <Typography variant="body2"><strong>Customer Name:</strong> {confirmedOrderData.customerName}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {confirmedOrderData.customerEmail}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Payment Status</Typography>
                      <Typography variant="body2"><strong>Payment Method:</strong> {confirmedOrderData.paymentMethod}</Typography>
                      <Typography variant="body2"><strong>Account Holder:</strong> {confirmedOrderData.accountHolderName}</Typography>
                      <Typography variant="body2"><strong>Amount Paid:</strong> R {confirmedOrderData.amountPaid.toFixed(2)}</Typography>
                      <Chip label={confirmedOrderData.status} color="success" size="small" sx={{ mt: 1, fontWeight: 'bold' }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Service Address</Typography>
                      <Typography variant="body2">{confirmedOrderData.serviceAddress}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Delivery Address</Typography>
                      <Typography variant="body2">{confirmedOrderData.deliveryAddress}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<DownloadIcon />} 
                      onClick={downloadContractReceipt}
                      sx={{ py: 1.5, px: 4, fontWeight: 'bold' }}
                    >
                      Download Proof of Payment
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => setConfirmedOrderData(null)}
                      sx={{ py: 1.5, px: 4, fontWeight: 'bold' }}
                    >
                      Place Another Order / Reset
                    </Button>
                  </Box>
                </Paper>
              ) : (
                /* CONTRACT ORDER & PAY FORM */
                <Paper component="form" onSubmit={handleCompleteContractOrder} sx={{ p: { xs: 3, md: 5 }, border: 1, borderColor: 'divider', borderRadius: 4 }}>
                  
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>
                    Pay My Contract
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
                    Complete your customer authentication, service address, and payment method to finalize contract services.
                  </Typography>

                  {/* STEP 1: AUTHENTICATION CHECK */}
                  <Paper sx={{ p: 3, mb: 4, bgcolor: darkMode ? '#0f172a' : '#f8fafc', border: 1, borderColor: 'divider' }}>
                    
                    {/* LOGGED-IN ACCOUNT DASHBOARD BAR */}
                    {isLoggedIn && loggedInUser ? (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                              <AccountCircleIcon fontSize="large" />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Welcome back, {loggedInUser.name}!
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Signed in as: <strong>{loggedInUser.email}</strong>
                              </Typography>
                            </Box>
                          </Box>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            startIcon={<ExitToAppIcon />}
                            onClick={handleUserLogout}
                            sx={{ fontWeight: 'bold' }}
                          >
                            Log Out
                          </Button>
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'block', mb: 1 }}>
                          Account Features & Quick Actions
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <HistoryIcon color="primary" />
                              <Box>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>Active Contracts</Typography>
                                <Typography variant="caption" color="text.secondary">1 Active Service</Typography>
                              </Box>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CreditCardIcon color="primary" />
                              <Box>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>Billing Status</Typography>
                                <Chip label="Up to Date" color="success" size="small" sx={{ height: 18, fontSize: '10px' }} />
                              </Box>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ShieldIcon color="primary" />
                              <Box>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>Account Tier</Typography>
                                <Typography variant="caption" color="text.secondary">Verified Member</Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    ) : (
                      /* NOT LOGGED IN AUTH FORM */
                      <Box>
                        <FormControl component="fieldset" fullWidth>
                          <FormLabel sx={{ fontWeight: 'bold', mb: 1 }}>Already a Customer?</FormLabel>
                          <RadioGroup 
                            row 
                            value={customerType} 
                            onChange={(e) => setCustomerType(e.target.value as 'yes' | 'no')}
                          >
                            <FormControlLabel value="yes" control={<Radio />} label="Yes (Log In)" />
                            <FormControlLabel value="no" control={<Radio />} label="No (Create Account)" />
                          </RadioGroup>
                        </FormControl>

                        {customerType === 'yes' ? (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LockOutlinedIcon color="primary" fontSize="small" /> Customer Login Details
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField 
                                  fullWidth 
                                  label="Account Email or User ID" 
                                  required 
                                  value={loginEmail}
                                  onChange={(e) => setLoginEmail(e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField 
                                  fullWidth 
                                  type="password" 
                                  label="Password" 
                                  required 
                                  value={loginPassword}
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                />
                              </Grid>
                            </Grid>
                            <Button 
                              variant="contained" 
                              onClick={handleUserLogin}
                              sx={{ mt: 2, fontWeight: 'bold' }}
                            >
                              Log In & Continue
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonAddOutlinedIcon color="primary" fontSize="small" /> Create New Account
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField 
                                  fullWidth 
                                  label="Full Name & Surname" 
                                  required 
                                  value={registerName}
                                  onChange={(e) => setRegisterName(e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField 
                                  fullWidth 
                                  type="email" 
                                  label="Email Address" 
                                  required 
                                  value={registerEmail}
                                  onChange={(e) => setRegisterEmail(e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField 
                                  fullWidth 
                                  label="Contact Number" 
                                  required 
                                  value={registerPhone}
                                  onChange={(e) => setRegisterPhone(e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField 
                                  fullWidth 
                                  type="password" 
                                  label="Create Password" 
                                  required 
                                  value={registerPassword}
                                  onChange={(e) => setRegisterPassword(e.target.value)}
                                />
                              </Grid>
                            </Grid>
                            <Button 
                              variant="contained" 
                              color="secondary"
                              onClick={handleUserRegister}
                              sx={{ mt: 2, fontWeight: 'bold', color: '#ffffff' }}
                            >
                              Create Account & Proceed
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>

                  {/* RESTRICTED ORDER DETAILS */}
                  {!isLoggedIn && customerType === 'yes' ? (
                    <Alert severity="info" sx={{ mt: 2, p: 2, borderRadius: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        🔒 Login Required to Complete Order
                      </Typography>
                      Please enter your credentials above and click <strong>"Log In & Continue"</strong> to unlock service address, payment, and order submission options.
                    </Alert>
                  ) : (
                    <Box>
                      {/* STEP 2: SERVICE ADDRESS */}
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Service Address
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <FormLabel sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '13px' }}>Address Type</FormLabel>
                            <Select
                              value={addressType}
                              onChange={(e) => setAddressType(e.target.value)}
                              size="small"
                            >
                              <MenuItem value="Free Standing House">Free Standing House</MenuItem>
                              <MenuItem value="Apartment / Complex">Apartment / Complex</MenuItem>
                              <MenuItem value="Estate">Estate</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="Street Number" required value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                          <TextField fullWidth label="Street Name" required value={streetName} onChange={(e) => setStreetName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Suburb" required value={suburb} onChange={(e) => setSuburb(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="City" required value={city} onChange={(e) => setCity(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Province" required value={province} onChange={(e) => setProvince(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Postal Code" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                        </Grid>
                      </Grid>

                      {/* STEP 3: DELIVERY ADDRESS */}
                      <Paper sx={{ p: 3, mb: 4, bgcolor: darkMode ? '#0f172a' : '#f8fafc', border: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          Delivery Address
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                          Delivery of routers, SIM cards or other hardware takes place from Monday to Friday from 8am to 5pm.
                        </Alert>

                        <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                          <RadioGroup 
                            row 
                            value={isNewDeliveryAddress ? 'new' : 'same'} 
                            onChange={(e) => setIsNewDeliveryAddress(e.target.value === 'new')}
                          >
                            <FormControlLabel value="same" control={<Radio />} label="Same address as service address above" />
                            <FormControlLabel value="new" control={<Radio />} label="Deliver to a new address" />
                          </RadioGroup>
                        </FormControl>

                        {isNewDeliveryAddress && (
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={4}>
                              <TextField fullWidth label="Street Number" required value={delStreetNumber} onChange={(e) => setDelStreetNumber(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                              <TextField fullWidth label="Street Name" required value={delStreetName} onChange={(e) => setDelStreetName(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="Suburb" required value={delSuburb} onChange={(e) => setDelSuburb(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="City" required value={delCity} onChange={(e) => setDelCity(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="Province" required value={delProvince} onChange={(e) => setDelProvince(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="Postal Code" required value={delPostalCode} onChange={(e) => setDelPostalCode(e.target.value)} />
                            </Grid>
                          </Grid>
                        )}
                      </Paper>

                      {/* STEP 4: METHODS OF PAYMENT */}
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Method of Payment
                      </Typography>

                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <Select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          size="small"
                        >
                          <MenuItem value="Credit/Debit Card">Credit/Debit Card</MenuItem>
                          <MenuItem value="Debit Order">Monthly Debit Order</MenuItem>
                          <MenuItem value="EFT">Direct EFT / Bank Transfer</MenuItem>
                        </Select>
                      </FormControl>

                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Account Holder Name" required value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Account Number" required value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <FormLabel sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '13px' }}>Account Type</FormLabel>
                            <Select
                              value={accountType}
                              onChange={(e) => setAccountType(e.target.value)}
                              size="small"
                            >
                              <MenuItem value="Savings">Savings</MenuItem>
                              <MenuItem value="Cheque / Current">Cheque / Current</MenuItem>
                              <MenuItem value="Transmission">Transmission</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="Bank Name" required value={bankName} onChange={(e) => setBankName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="Branch Code" required value={branchCode} onChange={(e) => setBranchCode(e.target.value)} />
                        </Grid>
                      </Grid>

                      {/* STEP 5: ADDITIONAL INFORMATION */}
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Additional Information
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Enter any special delivery instructions, access codes, or additional note preferences..."
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        sx={{ mb: 3 }}
                      />

                      {/* STEP 6: TERMS & CONDITIONS CHECKBOX */}
                      <Box sx={{ mb: 4 }}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={agreedTerms} 
                              onChange={(e) => setAgreedTerms(e.target.checked)} 
                              color="primary"
                            />
                          }
                          label={<Typography variant="body2">I have read and agree to The Connection Hub Terms & Conditions and service terms.</Typography>}
                        />
                      </Box>

                      {isSubmittingOrder && <LinearProgress sx={{ mb: 2 }} />}

                      <Button 
                        type="submit" 
                        fullWidth 
                        variant="contained" 
                        disabled={isSubmittingOrder} 
                        sx={{ py: 1.8, fontWeight: 'bold', fontSize: '16px' }}
                      >
                        {isSubmittingOrder ? 'Processing Contract Order...' : 'Complete My Order'}
                      </Button>
                    </Box>
                  )}

                </Paper>
              )}
            </Box>
          )}

          {/* TAB 3: INTERACTIVE HUB TOOLS */}
          {activeTab === 2 && (
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <Paper sx={{ p: 4, mb: 4, border: 1, borderColor: 'divider', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                <Box sx={{ maxWidth: 400 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold', mb: 1, textTransform: 'uppercase' }}>
                    <GaugeIcon /> Real-time Speed Test
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Test Your Connectivity Parameters</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Run safe, instant latency analyses against our premium server arrays locally.</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 140, height: 140, borderRadius: '50%', border: '4px dashed', borderColor: 'divider', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>{speedVal}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mbps</Typography>
                  </Box>
                  <Button variant="contained" disabled={isSpeedTesting} onClick={runSpeedTest} sx={{ borderRadius: 3, fontWeight: 'bold' }}>
                    {isSpeedTesting ? 'Running Audit...' : 'Initiate Scan'}
                  </Button>
                </Box>
              </Paper>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 1, borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold', mb: 1, textTransform: 'uppercase' }}>
                        <MapPinIcon /> Signal & Coverage Lookup
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Is The Hub ready in your region?</Typography>
                      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>Enter your postal code check-box below to verify network metrics.</Typography>
                      
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
                      <Paper sx={{ p: 2, mt: 3, bgcolor: darkMode ? '#0f172a' : '#f8fafc', border: 1, borderColor: 'divider' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{coverageStatus}</Typography>
                      </Paper>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, height: '100%', border: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold', mb: 1, textTransform: 'uppercase' }}>
                        <HomeIcon /> Wi-Fi Mesh Planner
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Configure mesh system pods</Typography>
                      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>Drag the slider parameters below to calculate optimal hardware nodes.</Typography>

                      <Box sx={{ px: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>House Footprint Size</Typography>
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

        {/* FLOATING LIVE SUPPORT CHAT */}
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
          {chatOpen ? (
            <Paper sx={{ width: 320, height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 1, borderColor: 'divider', boxShadow: 6 }}>

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
                    <Paper sx={{ p: 1.5, bgcolor: m.sender === 'user' ? 'primary.main' : (darkMode ? '#0f172a' : '#f8fafc'), color: m.sender === 'user' ? 'white' : 'text.primary', borderRadius: 2, border: m.sender === 'bot' ? 1 : 0, borderColor: 'divider' }}>
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

        {/* SHOPPING CART DRAWER */}
        <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)}>
          <Box sx={{ width: { xs: '100vw', sm: 400 }, p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ overflowY: 'auto' }}>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCartIcon color="primary" /> My Hub Cart
                </Typography>
                <IconButton onClick={() => setIsCartOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {cart.length === 0 ? (
                <Typography variant="body2" align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Your Connection Cart is empty. Select high-speed options in our store.
                </Typography>
              ) : (
                <List disablePadding>
                  {cart.map((item) => (
                    <Paper key={item.id} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                          <Typography variant="caption" color="primary">{item.speed}</Typography>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R {item.price * item.quantity}</Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                          <Button size="small" sx={{ minWidth: 24, p: 0 }} onClick={() => updateQuantity(item.id, -1)}>-</Button>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.quantity}</Typography>
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
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R {subTotalAmount.toFixed(2)}</Typography>
                  </Box>
                  {appliedDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="success.main">Discount ({appliedDiscount}%):</Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>- R {discountAmount.toFixed(2)}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Bill:</Typography>
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