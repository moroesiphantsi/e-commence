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
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  CircularProgress,
  TableRow,
  Chip
} from '@mui/material';

// --- MUI ICONS ---
import WifiIcon from '@mui/icons-material/Wifi';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import ZapIcon from '@mui/icons-material/FlashOn';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import MapPinIcon from '@mui/icons-material/Place';
import MessageSquareIcon from '@mui/icons-material/Chat';
import SunIcon from '@mui/icons-material/LightMode';
import MoonIcon from '@mui/icons-material/DarkMode';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BuildIcon from '@mui/icons-material/Build';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// --- FIREBASE IMPORT ---
import { db } from '../firebase'; 
import { ref, onValue, set, push } from 'firebase/database';

// --- TYPES & INTERFACES ---
interface Product {
  id: string;
  name: string;
  speed: string;
  uploadSpeed: string;
  price: number;
  type: 'Fibre';
  dataAllowance: string;
  installationFee: string;
  routerInfo: string;
  contractType: string;
  popular?: boolean;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface SupportTicket {
  ticketNumber: string;
  issueType: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  date: string;
}

interface CoverageResult {
  hasCoverage: boolean;
  status: string;
  location: string;
  coordinates: { lat: string; lon: string };
}

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt?: string;
}

interface OrderRecord {
  id?: string;
  transactionId: string;
  accountNo: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceAddress: string;
  paymentMethod: string;
  amountPaid: number;
  status: string;
  trackingStepIndex: number;
  installationDate: string;
  installationSlot: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Telkom FTTH Easy 20 Mbps', speed: '20 Mbps', uploadSpeed: '10 Mbps', price: 345, type: 'Fibre', dataAllowance: 'Uncapped', installationFee: 'Free Standard', routerInfo: 'Dual-Band Wi-Fi 5', contractType: 'Month-to-Month', description: 'Entry-level Fibre perfect for messaging, basic streaming, and light browsing.' },
  { id: 'p2', name: 'Telkom FTTH Easy 40 Mbps', speed: '40 Mbps', uploadSpeed: '20 Mbps', price: 425, type: 'Fibre', dataAllowance: 'Uncapped', installationFee: 'Free Standard', routerInfo: 'Dual-Band Wi-Fi 5', contractType: 'Month-to-Month', description: 'Great for small households streaming HD videos on multiple screens.' },
  { id: 'p3', name: 'Telkom FTTH Core 50 Mbps', speed: '50 Mbps', uploadSpeed: '50 Mbps', price: 695, type: 'Fibre', dataAllowance: 'Uncapped', installationFee: 'Free Standard', routerInfo: 'Wi-Fi 6 Smart Router', contractType: 'Month-to-Month', description: 'Symmetrical 50Mbps connection designed for remote work and video conferencing.' },
  { id: 'p4', name: 'Telkom FTTH Stream 100 Mbps', speed: '100 Mbps', uploadSpeed: '100 Mbps', price: 895, type: 'Fibre', dataAllowance: 'Uncapped', installationFee: 'Free Standard', routerInfo: 'Wi-Fi 6 Smart Router', contractType: 'Month-to-Month', popular: true, description: 'High-speed uncapped Fibre ideal for 4K streaming and simultaneous gaming.' },
  { id: 'p5', name: 'Telkom FTTH Turbo 200 Mbps', speed: '200 Mbps', uploadSpeed: '100 Mbps', price: 1299, type: 'Fibre', dataAllowance: 'Uncapped', installationFee: 'Free Standard', routerInfo: 'Wi-Fi 6 Mesh Ready', contractType: 'Month-to-Month', description: 'Ultra-fast downloads and heavy file uploads for power users.' },
  { id: 'p6', name: 'Telkom FTTH Ultra 500 Mbps', speed: '500 Mbps', uploadSpeed: '250 Mbps', price: 1699, type: 'Fibre', dataAllowance: 'Uncapped', installationFee: 'Free Standard', routerInfo: 'Wi-Fi 6E Mesh Bundle', contractType: 'Month-to-Month', description: 'Enterprise-grade speed for heavy smart homes and concurrent 8K streaming.' },
  { id: 'p7', name: 'Telkom FTTH Gigabit Extreme 1 Gbps', speed: '1000 Mbps', uploadSpeed: '500 Mbps', price: 2299, type: 'Fibre', dataAllowance: 'Uncapped', installationFee: 'Free Premium VIP', routerInfo: 'Tri-Band Wi-Fi 7 Router', contractType: 'Month-to-Month', description: 'Top tier Gigabit connection with lowest ping and maximum speed performance.' }
];

const TRACKING_STEPS = [
  'Order Received',
  'Installation Scheduled',
  'Technician Assigned',
  'Technician On The Way',
  'Installation Active',
  'Line Activated'
];

export default function ECommerce() {
  const [darkMode, setDarkMode] = useState(false);

  // Dynamic Theme Setup
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#2563eb' },
      secondary: { main: '#38bdf8' },
      background: {
        default: darkMode ? '#0f172a' : '#ffffff',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#f8fafc' : '#000000',
        secondary: darkMode ? '#cbd5e1' : '#333333',
      },
    },
    typography: { fontFamily: 'Roboto, sans-serif' },
    shape: { borderRadius: 16 },
  });

  // Navigation tabs (0: Fibre Plans, 1: Checkout, 2: My Profile & Statuses)
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Coverage Verification States
  const [coverageAddress, setCoverageAddress] = useState({ street: '', suburb: '', city: '', postalCode: '' });
  const [coverageChecked, setCoverageChecked] = useState(false);
  const [isFibreAvailable, setIsFibreAvailable] = useState<boolean | null>(null);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [coverageResult, setCoverageResult] = useState<CoverageResult | null>(null);
  const [coverageError, setCoverageError] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');

  // Plan Selection & Customization
  const [selectedPlanForCustomization, setSelectedPlanForCustomization] = useState<Product | null>(null);
  const [addonStaticIP, setAddonStaticIP] = useState(false);

  // User Auth & Account States
  const [customerType, setCustomerType] = useState<'login' | 'register'>('register');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null);

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Service Address State
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [suburb, setSuburb] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('Gauteng');
  const [postalCode, setPostalCode] = useState('');

  // Payment Details State
  const [paymentMethod, setPaymentMethod] = useState<'Debit Order' | 'Credit/Debit Card' | 'EFT'>('Credit/Debit Card');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchCode, setBranchCode] = useState('');

  // Installation Scheduling
  const [installationDate, setInstallationDate] = useState('');
  const [installationSlot, setInstallationSlot] = useState('Morning (08:00 - 12:00)');

  // Support Tickets & User Orders (Stored in Database)
  const [userOrders, setUserOrders] = useState<OrderRecord[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [selectedIssue, setSelectedIssue] = useState('Internet not working');

  // Order Submission States
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = useState<OrderRecord | null>(null);

  // General App States
  const [searchQuery, setSearchQuery] = useState('');
  const [uptimePct] = useState(99.98);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([]);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const OPENSERVE_GIS_BASE = 'https://apps.openserve.co.za/gis/apps/api';

  const triggerToast = (message: string, severity: 'success' | 'info' | 'error' = 'info') => {
    setToast({ open: true, message, severity });
  };

  // -------------------------------------------------------------
  // REAL-TIME FIREBASE SYNCHRONIZATION LISTENERS
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Sync Fibre Products
    const productsRef = ref(db, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Array.isArray(data) ? data : Object.values(data);
        const fibreOnly = list.filter((p: any) => p.type === 'Fibre');
        setProducts(fibreOnly.length > 0 ? fibreOnly : DEFAULT_PRODUCTS);
      } else {
        set(productsRef, DEFAULT_PRODUCTS);
        setProducts(DEFAULT_PRODUCTS);
      }
    });

    // 2. Sync Current Visitor Cart
    const cartRef = ref(db, 'visitorSessions/guest_user/cart');
    const unsubscribeCart = onValue(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        setCart(snapshot.val());
      }
    });

    // 3. Sync User Session
    const userRef = ref(db, 'visitorSessions/guest_user/loggedInUser');
    const unsubscribeUser = onValue(userRef, (snapshot) => {
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

    // 4. Sync Realtime Support Tickets
    const ticketsRef = ref(db, 'supportTickets');
    const unsubscribeTickets = onValue(ticketsRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setSupportTickets(Array.isArray(val) ? val : Object.values(val));
      }
    });

    // 5. Sync Active Orders
    const ordersRef = ref(db, 'contractOrders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const ordersList: OrderRecord[] = Array.isArray(val) ? val : Object.values(val);
        setUserOrders(ordersList);
      }
    });

    // 6. Sync Live Chat
    const chatRef = ref(db, 'supportChats/guest_user/messages');
    const unsubscribeChat = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setChatMessages(Array.isArray(val) ? val : Object.values(val));
      } else {
        const defaultMsg = [
          { sender: 'bot' as const, text: 'Hello! Welcome to The Connection Hub Fibre Assistant. How can I assist you with Fibre coverage or orders today?' }
        ];
        set(chatRef, defaultMsg);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCart();
      unsubscribeUser();
      unsubscribeTickets();
      unsubscribeOrders();
      unsubscribeChat();
    };
  }, []);

  // -------------------------------------------------------------
  // HANDLERS & ACTIONS
  // -------------------------------------------------------------
  const saveCartToDb = (newCart: CartItem[]) => {
    setCart(newCart);
    set(ref(db, 'visitorSessions/guest_user/cart'), newCart);
  };

  const handleCoverageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverageAddress.street || !coverageAddress.suburb) {
      triggerToast('Please fill in your street and suburb.', 'error');
      return;
    }

    setCoverageLoading(true);
    setCoverageError(null);
    setCoverageResult(null);

    const fullAddress = `${coverageAddress.street}, ${coverageAddress.suburb}, ${coverageAddress.city} ${coverageAddress.postalCode}, South Africa`;

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
      );
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        throw new Error('Address could not be geocoded. Please verify street details.');
      }

      const { lat, lon } = geoData[0];

      const wmsParams = new URLSearchParams({
        SERVICE: 'WMS',
        VERSION: '1.1.1',
        REQUEST: 'GetFeatureInfo',
        LAYERS: 'OpenServeFTTH',
        QUERY_LAYERS: 'OpenServeFTTH',
        INFO_FORMAT: 'application/json',
        X: '50',
        Y: '50',
        WIDTH: '100',
        HEIGHT: '100',
        SRS: 'EPSG:4326',
        BBOX: `${parseFloat(lon) - 0.001},${parseFloat(lat) - 0.001},${parseFloat(lon) + 0.001},${parseFloat(lat) + 0.001}`
      });

      const response = await fetch(`${OPENSERVE_GIS_BASE}/samples/OpenServeFTTH-WMS.html?${wmsParams.toString()}`);

      setCoverageChecked(true);
      if (response.ok) {
        setIsFibreAvailable(true);
        setCoverageResult({
          hasCoverage: true,
          status: 'Fibre Ready',
          location: `${coverageAddress.street}, ${coverageAddress.suburb}`,
          coordinates: { lat, lon }
        });
        triggerToast('🎉 OpenServe Fibre is available in your area!', 'success');
      } else {
        throw new Error('Failed to verify coverage from network server.');
      }

      // Save coverage check query to Firebase RTDB
      push(ref(db, 'leads/coverageChecks'), {
        ...coverageAddress,
        available: response.ok,
        coordinates: { lat, lon },
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {
      setCoverageError(err.message || 'An error occurred while checking coverage.');
      setIsFibreAvailable(false);
      triggerToast(err.message || 'Error verifying coverage.', 'error');
    } finally {
      setCoverageLoading(false);
    }
  };

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistPhone) {
      triggerToast('Please provide your email and phone number.', 'error');
      return;
    }
    push(ref(db, 'leads/waitlist'), {
      email: waitlistEmail,
      phone: waitlistPhone,
      address: coverageAddress,
      timestamp: new Date().toISOString()
    });
    triggerToast('Added to waitlist! We will notify you once Fibre arrives.', 'success');
    setWaitlistEmail('');
    setWaitlistPhone('');
  };

  const handleSelectPlan = (plan: Product) => {
    setSelectedPlanForCustomization(plan);
    addToCart(plan);
    setActiveTab(1); // Navigate directly to Checkout
  };

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      triggerToast('Please enter your email and password.', 'error');
      return;
    }
    const derivedName = loginEmail.split('@')[0].toUpperCase();
    const userObj: UserProfile = { 
      name: derivedName, 
      email: loginEmail, 
      phone: '0820000000',
      createdAt: new Date().toISOString() 
    };
    
    set(ref(db, 'visitorSessions/guest_user/loggedInUser'), userObj);
    setAccountHolderName(derivedName);
    triggerToast(`Welcome back, ${derivedName}! Account logged in.`, 'success');
  };

  const handleUserRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      triggerToast('Please complete all account registration fields.', 'error');
      return;
    }
    const cleanPhone = registerPhone.replace(/[^0-9]/g, '');
    const userObj: UserProfile = { 
      id: cleanPhone,
      name: registerName, 
      email: registerEmail, 
      phone: registerPhone,
      createdAt: new Date().toISOString() 
    };

    // Save user to Realtime DB under users/
    set(ref(db, `users/${cleanPhone}`), userObj);
    set(ref(db, 'visitorSessions/guest_user/loggedInUser'), userObj);
    setAccountHolderName(registerName);
    triggerToast('Account created successfully!', 'success');
  };

  const handleUserLogout = () => {
    set(ref(db, 'visitorSessions/guest_user/loggedInUser'), null);
    setLoginPassword('');
    triggerToast('Logged out successfully.', 'info');
  };

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
  const extraAddonPrice = addonStaticIP ? 99 : 0;
  const totalCartAmount = subTotalAmount + extraAddonPrice;

  const handleCompleteContractOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // MANDATORY ACCOUNT CHECK
    if (!isLoggedIn && !loggedInUser) {
      triggerToast('Please create an account or log in before completing payment!', 'error');
      setCustomerType('register');
      return;
    }

    if (!agreedTerms) {
      triggerToast('Please accept terms and conditions to proceed', 'error');
      return;
    }

    setIsSubmittingOrder(true);
    
    setTimeout(() => {
      const fullServiceAddress = `${streetNumber} ${streetName}, ${suburb}, ${city}, ${province}, ${postalCode}`;
      const accountNoGenerated = `TCH-${Math.floor(100000 + Math.random() * 900000)}`;
      const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderPayload: OrderRecord = {
        transactionId: txnId,
        accountNo: accountNoGenerated,
        date: new Date().toISOString().split('T')[0],
        customerName: loggedInUser?.name || registerName || 'Customer',
        customerEmail: loggedInUser?.email || registerEmail,
        customerPhone: loggedInUser?.phone || registerPhone || 'N/A',
        serviceAddress: fullServiceAddress,
        paymentMethod: paymentMethod,
        amountPaid: totalCartAmount > 0 ? totalCartAmount : 699.00,
        status: 'Installation Scheduled',
        trackingStepIndex: 1,
        installationDate: installationDate || 'Next Available Slot',
        installationSlot: installationSlot
      };

      // Save order to Realtime DB
      const contractRef = ref(db, 'contractOrders');
      const newContractPush = push(contractRef);
      set(newContractPush, {
        ...orderPayload,
        timestamp: new Date().toISOString()
      });

      setConfirmedOrderData(orderPayload);
      setIsSubmittingOrder(false);
      saveCartToDb([]); // Clear cart
      triggerToast('🎉 Fibre Order Confirmed & Stored in Database!', 'success');
    }, 2000);
  };

  const handleCreateSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      ticketNumber: ticketId,
      issueType: selectedIssue,
      status: 'Open',
      date: new Date().toISOString().split('T')[0]
    };

    push(ref(db, 'supportTickets'), newTicket);
    triggerToast(`Support ticket ${ticketId} created! Status: Open`, 'success');
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

      if (lower.includes('fibre') || lower.includes('speed') || lower.includes('package')) {
        botResponse = "We offer Uncapped Gigabit Fibre starting from R345/pm with free standard router and installation!";
      } else if (lower.includes('coverage') || lower.includes('address')) {
        botResponse = "You can check coverage on the Fibre Plans tab by typing your street and suburb.";
      } else if (lower.includes('order') || lower.includes('track') || lower.includes('status')) {
        botResponse = "Check your My Profile & Order Status tab to track installation steps in real-time.";
      } else if (lower.includes('pay') || lower.includes('account')) {
        botResponse = "Accounts can be created during checkout. We accept Debit Orders, Cards, and direct EFTs.";
      }
      
      const newMessages = [...updatedMessages, { sender: 'bot' as const, text: botResponse }];
      setChatMessages(newMessages);
      set(ref(db, 'supportChats/guest_user/messages'), newMessages);
    }, 1000);
  };

  const downloadContractReceipt = () => {
    if (!confirmedOrderData) return;
    const receiptText = `
=====================================================
      THE CONNECTION HUB - FIBRE PROOF OF ORDER   
=====================================================
Order Ref ID:    ${confirmedOrderData.transactionId}
Account Number:  ${confirmedOrderData.accountNo}
Date:            ${confirmedOrderData.date}
Customer Name:   ${confirmedOrderData.customerName}
Customer Email:  ${confirmedOrderData.customerEmail}

--- INSTALLATION & SERVICE DETAILS ---
Service Address:   ${confirmedOrderData.serviceAddress}
Installation Date: ${confirmedOrderData.installationDate} (${confirmedOrderData.installationSlot})

--- PAYMENT DETAILS ---
Payment Method:   ${confirmedOrderData.paymentMethod}
Amount Paid:      R ${confirmedOrderData.amountPaid.toFixed(2)}
Status:           ${confirmedOrderData.status}

Thank you for choosing The Connection Hub Fibre!
=====================================================
    `;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fibre_Order_${confirmedOrderData.transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    prod.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    Fast Uncapped Fibre
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: darkMode ? '#0f172a' : '#f8fafc', border: 1, borderColor: 'divider', borderRadius: 4, p: 0.5 }}>
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} indicatorColor="primary" textColor="primary">
                  <Tab label="Fibre Plans" sx={{ fontWeight: 'bold', fontSize: '13px' }} />
                  <Tab label="Checkout & Order" sx={{ fontWeight: 'bold', fontSize: '13px' }} />
                  <Tab label="My Profile & Statuses" sx={{ fontWeight: 'bold', fontSize: '13px' }} />
                </Tabs>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isLoggedIn && loggedInUser ? (
                  <Chip 
                    avatar={<Avatar>{loggedInUser.name.charAt(0)}</Avatar>}
                    label={loggedInUser.name}
                    color="primary"
                    variant="outlined"
                    onClick={() => setActiveTab(2)}
                    sx={{ fontWeight: 'bold' }}
                  />
                ) : (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<AccountCircleIcon />}
                    onClick={() => setActiveTab(1)}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Create Account / Login
                  </Button>
                )}

                <IconButton onClick={() => setDarkMode(!darkMode)} color="primary" sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 1 }}>
                  {darkMode ? <SunIcon /> : <MoonIcon />}
                </IconButton>
                <IconButton onClick={() => setIsCartOpen(true)} color="primary" sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 1 }}>
                  <Badge badgeContent={cart.reduce((sum, item) => sum + item.quantity, 0)} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Box>

            </Toolbar>
          </Container>
        </AppBar>

        {/* MOBILE TABS */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, py: 1, bgcolor: darkMode ? '#1e293b' : '#ffffff', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} variant="fullWidth">
            <Tab label="Fibre Plans" />
            <Tab label="Checkout" />
            <Tab label="My Profile & Status" />
          </Tabs>
        </Box>

        {/* UPTIME & SYSTEM BAR */}
        <Box sx={{ bgcolor: darkMode ? '#0f172a' : '#f8fafc', py: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#10b981', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            OpenServe Fibre Network: <Box component="span" sx={{ color: '#10b981', fontWeight: 800 }}>{uptimePct}% Active Operational</Box>
          </Typography>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 5 }}>
          
          {/* TAB 0: FIBRE PLANS & COVERAGE */}
          {activeTab === 0 && (
            <Box>
              {/* HERO */}
              <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, mb: 5, background: darkMode ? '#1e293b' : '#f8fafc', border: 1, borderColor: 'divider' }}>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                      Lightning Fast Uncapped Fibre Internet
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, color: 'text.secondary' }}>
                      Experience high-speed, unthrottled Fibre powered by OpenServe. Check coverage at your address and choose your plan.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button variant="contained" startIcon={<MapPinIcon />} onClick={() => {
                        const el = document.getElementById('coverage-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }} sx={{ fontWeight: 'bold', py: 1.2 }}>
                        Check Coverage Now
                      </Button>
                      <Button variant="outlined" startIcon={<CompareArrowsIcon />} onClick={() => {
                        const el = document.getElementById('plans-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }} sx={{ fontWeight: 'bold', py: 1.2 }}>
                        Browse Fibre Plans
                      </Button>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: darkMode ? '#0f172a' : '#ffffff', border: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                        <ZapIcon /> Fibre Benefits
                      </Typography>
                      <List dense>
                        <Typography variant="body2" sx={{ my: 0.5 }}>✓ Uncapped & Unthrottled 24/7</Typography>
                        <Typography variant="body2" sx={{ my: 0.5 }}>✓ Free Standard Wi-Fi Router</Typography>
                        <Typography variant="body2" sx={{ my: 0.5 }}>✓ Free Standard Fibre Installation</Typography>
                        <Typography variant="body2" sx={{ my: 0.5 }}>✓ Month-to-Month Contracts</Typography>
                      </List>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* COVERAGE CHECKER */}
              <Paper id="coverage-section" sx={{ p: 4, mb: 5, border: 1, borderColor: 'divider', borderRadius: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPinIcon color="primary" /> Check Fibre Coverage
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Verify if OpenServe Fibre connectivity is active at your installation location:
                </Typography>

                <Box component="form" onSubmit={handleCoverageSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth size="small" label="Street Address" value={coverageAddress.street} onChange={(e) => setCoverageAddress({ ...coverageAddress, street: e.target.value })} required />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth size="small" label="Suburb" value={coverageAddress.suburb} onChange={(e) => setCoverageAddress({ ...coverageAddress, suburb: e.target.value })} required />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth size="small" label="City" value={coverageAddress.city} onChange={(e) => setCoverageAddress({ ...coverageAddress, city: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth size="small" label="Postal Code" value={coverageAddress.postalCode} onChange={(e) => setCoverageAddress({ ...coverageAddress, postalCode: e.target.value })} />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" fullWidth disabled={coverageLoading} sx={{ fontWeight: 'bold', py: 1.2 }}>
                        {coverageLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify Coverage'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {coverageResult && (
                  <Alert severity="success" sx={{ mt: 3 }}>
                    <strong>Status: {coverageResult.status}</strong> — Fibre is available at {coverageResult.location}.
                  </Alert>
                )}

                {coverageError && (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    {coverageError}
                  </Alert>
                )}

                {coverageChecked && !coverageResult && (
                  <Box sx={{ mt: 3 }}>
                    {isFibreAvailable ? (
                      <Alert severity="success" variant="filled">
                        🎉 Fibre is available at your location! Choose a plan below to proceed.
                      </Alert>
                    ) : (
                      <Paper sx={{ p: 3, border: 1, borderColor: 'error.main', bgcolor: darkMode ? '#1e293b' : '#fff5f5' }}>
                        <Typography variant="h6" color="error" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Fibre is not currently available in your area.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Join our coverage waitlist and we will notify you immediately once Fibre expands to your street:
                        </Typography>
                        <Box component="form" onSubmit={handleJoinWaitlist} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <TextField size="small" placeholder="Your Email Address" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} required sx={{ flex: 1 }} />
                          <TextField size="small" placeholder="Mobile Number" value={waitlistPhone} onChange={(e) => setWaitlistPhone(e.target.value)} required sx={{ flex: 1 }} />
                          <Button type="submit" variant="contained" color="error" sx={{ fontWeight: 'bold' }}>
                            Join Waitlist
                          </Button>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                )}
              </Paper>

              {/* SEARCH & PLANS */}
              <Box id="plans-section">
                <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2, alignItems: 'center', borderRadius: 4, border: 1, borderColor: 'divider' }}>
                  <TextField 
                    fullWidth
                    placeholder="Search Fibre plans by speed (e.g. 50 Mbps, 100 Mbps, 1 Gbps)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    slotProps={{
                      input: { startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }
                    }}
                  />
                </Paper>

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                  Available Uncapped Fibre Packages
                </Typography>

                <Grid container spacing={3} sx={{ mb: 5 }}>
                  {filteredProducts.map((prod) => (
                    <Grid item xs={12} sm={6} md={4} key={prod.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: prod.popular ? 2 : 1, borderColor: prod.popular ? 'primary.main' : 'divider', position: 'relative' }}>
                        {prod.popular && <Chip label="POPULAR CHOICE" color="primary" sx={{ position: 'absolute', top: -12, right: 16, fontWeight: '900', fontSize: '10px' }} />}
                        <CardContent sx={{ pt: 3 }}>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {prod.dataAllowance} Data
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                            {prod.name}
                          </Typography>
                          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 900, my: 1.5 }}>
                            R {prod.price} <Box component="span" sx={{ fontSize: '14px', color: 'text.secondary', fontWeight: 'normal' }}>/pm</Box>
                          </Typography>
                          
                          <Divider sx={{ my: 1.5 }} />

                          <List dense>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Download Speed:</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{prod.speed}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Upload Speed:</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{prod.uploadSpeed}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Router Included:</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{prod.routerInfo}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Installation:</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>{prod.installationFee}</Typography>
                            </Box>
                          </List>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button fullWidth variant="contained" onClick={() => handleSelectPlan(prod)} sx={{ fontWeight: 'bold', borderRadius: 3, py: 1 }}>
                            Select This Package
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          )}

          {/* TAB 1: CHECKOUT & MANDATORY ACCOUNT CREATION */}
          {activeTab === 1 && (
            <Box sx={{ maxWidth: 850, mx: 'auto' }}>
              
              {confirmedOrderData ? (
                /* ORDER CONFIRMATION VIEW */
                <Paper sx={{ p: { xs: 3, md: 5 }, border: 2, borderColor: 'success.main', borderRadius: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 72, mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      🎉 Order Confirmed & Stored in Database!
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      Your Fibre order has been recorded. You can view progress in your profile dashboard.
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Order Details</Typography>
                      <Typography variant="body2"><strong>Order ID:</strong> {confirmedOrderData.transactionId}</Typography>
                      <Typography variant="body2"><strong>Account Number:</strong> {confirmedOrderData.accountNo}</Typography>
                      <Typography variant="body2"><strong>Customer Name:</strong> {confirmedOrderData.customerName}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {confirmedOrderData.customerEmail}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Installation & Status</Typography>
                      <Typography variant="body2"><strong>Scheduled Date:</strong> {confirmedOrderData.installationDate}</Typography>
                      <Typography variant="body2"><strong>Slot:</strong> {confirmedOrderData.installationSlot}</Typography>
                      <Typography variant="body2"><strong>Monthly Amount:</strong> R {confirmedOrderData.amountPaid.toFixed(2)}</Typography>
                      <Chip label={confirmedOrderData.status} color="success" size="small" sx={{ mt: 1, fontWeight: 'bold' }} />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={downloadContractReceipt} sx={{ py: 1.5, px: 4, fontWeight: 'bold' }}>
                      Download Proof of Order
                    </Button>
                    <Button variant="outlined" onClick={() => setActiveTab(2)} sx={{ py: 1.5, px: 4, fontWeight: 'bold' }}>
                      View Profile & Order Status ➔
                    </Button>
                  </Box>
                </Paper>
              ) : (
                /* FORM FLOW WITH MANDATORY ACCOUNT CREATION BEFORE PAYMENT */
                <Paper component="form" onSubmit={handleCompleteContractOrder} sx={{ p: { xs: 3, md: 5 }, border: 1, borderColor: 'divider', borderRadius: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>
                    Fibre Checkout & Registration
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
                    Create your account, provide installation address, and confirm payment details.
                  </Typography>

                  {/* STEP A: CREATE ACCOUNT / LOG IN (MANDATORY BEFORE PAYING) */}
                  <Paper sx={{ p: 3, mb: 4, border: 2, borderColor: isLoggedIn ? 'success.main' : 'primary.main', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountCircleIcon color="primary" /> Step 1: Customer Account Registration
                    </Typography>

                    {isLoggedIn && loggedInUser ? (
                      <Alert severity="success" action={<Button color="inherit" size="small" onClick={handleUserLogout}>Log Out</Button>}>
                        Account Verified: <strong>{loggedInUser.name} ({loggedInUser.email})</strong> — Phone: {loggedInUser.phone}
                      </Alert>
                    ) : (
                      <Box>
                        <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                          <RadioGroup row value={customerType} onChange={(e) => setCustomerType(e.target.value as any)}>
                            <FormControlLabel value="register" control={<Radio />} label="Create New Account" />
                            <FormControlLabel value="login" control={<Radio />} label="Existing Customer Login" />
                          </RadioGroup>
                        </FormControl>

                        {customerType === 'register' ? (
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="Full Name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth type="email" label="Email Address" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="Mobile Phone Number" value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth type="password" label="Create Password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                            </Grid>
                            <Grid item xs={12}>
                              <Button variant="contained" color="primary" onClick={handleUserRegister} sx={{ fontWeight: 'bold' }}>
                                Save Account Details
                              </Button>
                            </Grid>
                          </Grid>
                        ) : (
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="Email / Username" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth type="password" label="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                            </Grid>
                            <Grid item xs={12}>
                              <Button variant="contained" onClick={handleUserLogin} sx={{ fontWeight: 'bold' }}>
                                Log In Account
                              </Button>
                            </Grid>
                          </Grid>
                        )}
                      </Box>
                    )}
                  </Paper>

                  {/* STEP B: SELECTED PLAN & ADDONS */}
                  <Paper sx={{ p: 3, mb: 4, border: 1, borderColor: 'divider', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Step 2: Selected Fibre Package
                    </Typography>
                    
                    {selectedPlanForCustomization ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Package: <strong>{selectedPlanForCustomization.name} ({selectedPlanForCustomization.speed})</strong> — R{selectedPlanForCustomization.price}/pm
                      </Alert>
                    ) : (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        No plan pre-selected. Defaulting to <strong>Telkom FTTH Core 50 Mbps (R695/pm)</strong>.
                      </Alert>
                    )}

                    <FormControlLabel
                      control={<Checkbox checked={addonStaticIP} onChange={(e) => setAddonStaticIP(e.target.checked)} />}
                      label={<Typography variant="body2"><strong>Add Static IPv4 Address Add-on</strong> (+R99/pm)</Typography>}
                    />
                  </Paper>

                  {/* STEP C: INSTALLATION ADDRESS */}
                  <Paper sx={{ p: 3, mb: 4, border: 1, borderColor: 'divider', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Step 3: Installation Address
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Street Number" value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField fullWidth label="Street Name" value={streetName} onChange={(e) => setStreetName(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Province" value={province} onChange={(e) => setProvince(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* STEP D: INSTALLATION SCHEDULING */}
                  <Paper sx={{ p: 3, mb: 4, border: 1, borderColor: 'divider', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Step 4: Installation Appointment Schedule
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth type="date" label="Preferred Date" InputLabelProps={{ shrink: true }} value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <FormLabel sx={{ fontSize: '12px', fontWeight: 'bold' }}>Time Slot</FormLabel>
                          <Select value={installationSlot} onChange={(e) => setInstallationSlot(e.target.value)} size="small">
                            <MenuItem value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</MenuItem>
                            <MenuItem value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* STEP E: PAYMENT DETAILS */}
                  <Paper sx={{ p: 3, mb: 4, border: 1, borderColor: 'divider', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Step 5: Payment Details
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <FormLabel sx={{ fontSize: '12px', fontWeight: 'bold', mb: 1 }}>Payment Method</FormLabel>
                      <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} size="small">
                        <MenuItem value="Credit/Debit Card">Debit / Credit Card</MenuItem>
                        <MenuItem value="Debit Order">Monthly Debit Order</MenuItem>
                        <MenuItem value="EFT">Direct Bank EFT</MenuItem>
                      </Select>
                    </FormControl>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Account Holder Name" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Account / Card Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Branch Code" value={branchCode} onChange={(e) => setBranchCode(e.target.value)} required />
                      </Grid>
                    </Grid>
                  </Paper>

                  <FormControlLabel
                    control={<Checkbox checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} />}
                    label={<Typography variant="body2">I accept OpenServe Terms & Conditions and authorise service setup.</Typography>}
                    sx={{ mb: 3 }}
                  />

                  {isSubmittingOrder && <LinearProgress sx={{ mb: 2 }} />}

                  <Button type="submit" fullWidth variant="contained" disabled={isSubmittingOrder} sx={{ py: 1.8, fontWeight: 'bold', fontSize: '16px' }}>
                    {isSubmittingOrder ? 'Processing Order to Realtime Database...' : `Confirm & Submit Order (R ${totalCartAmount > 0 ? totalCartAmount : 695}/pm)`}
                  </Button>

                </Paper>
              )}
            </Box>
          )}

          {/* TAB 2: USER PROFILE & ORDER STATUS DASHBOARD */}
          {activeTab === 2 && (
            <Box sx={{ maxWidth: 950, mx: 'auto' }}>
              
              {/* ACCOUNT PROFILE INFO */}
              <Paper sx={{ p: 4, mb: 4, border: 1, borderColor: 'divider', borderRadius: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountCircleIcon color="primary" /> User Profile Information
                </Typography>

                {isLoggedIn && loggedInUser ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Full Name:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{loggedInUser.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Email Address:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{loggedInUser.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Mobile Phone:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{loggedInUser.phone || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => setActiveTab(1)}>Create Account</Button>}>
                    No account active. Please create or log in to an account to view saved profiles and order statuses.
                  </Alert>
                )}
              </Paper>

              {/* REALTIME ORDER TRACKING */}
              <Paper sx={{ p: 4, mb: 4, border: 1, borderColor: 'divider', borderRadius: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingIcon color="primary" /> Installation & Order Statuses
                </Typography>

                {userOrders.length === 0 ? (
                  <Alert severity="info">No active orders found in database. Place a Fibre order to track progress here.</Alert>
                ) : (
                  userOrders.map((ord, idx) => (
                    <Paper key={idx} sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider', bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Order ID: {ord.transactionId} ({ord.accountNo})
                        </Typography>
                        <Chip label={ord.status} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                      </Box>

                      <Stepper activeStep={ord.trackingStepIndex || 1} alternativeLabel sx={{ my: 3 }}>
                        {TRACKING_STEPS.map((label) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Installation Address:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{ord.serviceAddress}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Scheduled Date & Time:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{ord.installationDate} ({ord.installationSlot})</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))
                )}
              </Paper>

              {/* SUPPORT & TICKETS */}
              <Paper sx={{ p: 4, border: 1, borderColor: 'divider', borderRadius: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BuildIcon color="primary" /> Support & Ticket System
                </Typography>

                <Box component="form" onSubmit={handleCreateSupportTicket} sx={{ mb: 4 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <FormControl fullWidth size="small">
                        <FormLabel sx={{ fontSize: '12px', fontWeight: 'bold' }}>Report Issue Category</FormLabel>
                        <Select value={selectedIssue} onChange={(e) => setSelectedIssue(e.target.value)}>
                          <MenuItem value="Internet not working">Internet not working</MenuItem>
                          <MenuItem value="Slow speed">Slow speed</MenuItem>
                          <MenuItem value="Router problem">Router problem</MenuItem>
                          <MenuItem value="Billing problem">Billing problem</MenuItem>
                          <MenuItem value="Installation enquiry">Installation enquiry</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                      <Button type="submit" variant="contained" fullWidth sx={{ fontWeight: 'bold' }}>
                        Raise Support Ticket
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Your Support Tickets
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Ticket ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Issue Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {supportTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">No active tickets.</TableCell>
                        </TableRow>
                      ) : (
                        supportTickets.map((t) => (
                          <TableRow key={t.ticketNumber}>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t.ticketNumber}</TableCell>
                            <TableCell>{t.issueType}</TableCell>
                            <TableCell>{t.date}</TableCell>
                            <TableCell>
                              <Chip label={t.status} size="small" color={t.status === 'Open' ? 'warning' : 'primary'} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}

        </Container>

        {/* FLOATING AI ASSISTANT CHAT */}
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
          {chatOpen ? (
            <Paper sx={{ width: 330, height: 420, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 1, borderColor: 'divider', boxShadow: 6 }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Fibre AI Assistant</Typography>
                <IconButton size="small" onClick={() => setChatOpen(false)} sx={{ color: 'white' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {chatMessages.map((m, idx) => (
                  <Box key={idx} sx={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <Paper sx={{ p: 1.5, bgcolor: m.sender === 'user' ? 'primary.main' : (darkMode ? '#0f172a' : '#f8fafc'), color: m.sender === 'user' ? 'white' : 'text.primary', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px' }}>{m.text}</Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>

              <Box component="form" onSubmit={handleSendMessage} sx={{ p: 1.5, display: 'flex', gap: 1, borderTop: 1, borderColor: 'divider' }}>
                <TextField fullWidth size="small" placeholder="Ask AI Assistant..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                <IconButton type="submit" color="primary"><ArrowForwardIcon /></IconButton>
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
                  <ShoppingCartIcon color="primary" /> Selected Fibre Plan
                </Typography>
                <IconButton onClick={() => setIsCartOpen(false)}><CloseIcon /></IconButton>
              </Box>

              {cart.length === 0 ? (
                <Typography variant="body2" align="center" sx={{ py: 6, color: 'text.secondary' }}>Your cart is empty.</Typography>
              ) : (
                <List disablePadding>
                  {cart.map((item) => (
                    <Paper key={item.id} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R {item.price * item.quantity}/pm</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button size="small" onClick={() => updateQuantity(item.id, -1)}>-</Button>
                          <Typography variant="body2">{item.quantity}</Typography>
                          <Button size="small" onClick={() => updateQuantity(item.id, 1)}>+</Button>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </List>
              )}
            </Box>

            {cart.length > 0 && (
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Monthly Charge:</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: '900', color: 'primary.main' }}>R {totalCartAmount.toFixed(2)} /pm</Typography>
                </Box>
                <Button fullWidth variant="contained" onClick={() => { setIsCartOpen(false); setActiveTab(1); }} sx={{ py: 1.5, fontWeight: 'bold' }}>
                  Proceed to Checkout
                </Button>
              </Box>
            )}
          </Box>
        </Drawer>

      </Box>
    </ThemeProvider>
  );
}