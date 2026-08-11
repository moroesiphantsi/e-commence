import React, { useState, useEffect } from 'react';
// --- MATERIAL UI IMPORTS ---
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,

  InputLabel,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions

} from '@mui/material';

// --- MATERIAL UI ICONS ---
import {
  Wifi,
  Add,
  Delete,
  TrendingUp,
  People,
  CreditCard,
  Analytics,
  Edit,

  Download,
  Search,
  AutoAwesome,
  CheckCircle,
  AttachMoney,
  LocalOffer,
  FilePresent,
  CheckBox,
  TaskAlt 
} from '@mui/icons-material';

// --- FIREBASE IMPORT ---
import { db } from '../firebase'; // Import your configured Firebase Database instance
import { ref, onValue, set, push, remove, update } from 'firebase/database';

// --- TYPES & INTERFACES ---
interface Product {
  id: string;
  name: string;
  speed: string;
  price: number;

  type: 'Fibre' | 'LTE' | 'Mesh Wi-Fi';
  popular?: boolean;
  description: string;
  inStock: boolean;
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  accountNo: string;
  plan: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid';
  registrationDate: string;
}

interface PromotionCode {
  id: string;
  code: string;
  discountPercentage: number;
  active: boolean;
}


interface ISPLog {
  id: string;
  timestamp: string;
  message: string;
  source: 'SYSTEM' | 'MERCHANT' | 'DISPATCH' | 'ADMIN';
}

interface SupportTicket {
  id: string;
  clientName: string;
  subject: string;
  status: 'Open' | 'Resolved';
  message: string;
}

// --- MUI DARK 2026 THEME CREATION ---
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#06b6d4', // Cyan 500
    },

    secondary: {
      main: '#4f46e5', // Indigo 600
    },
    background: {
      default: '#070913',
      paper: 'rgba(13, 17, 34, 0.45)', // Custom glassy panel background
    },
    success: {
      main: '#10b981', // Emerald 500
    },
    warning: {
      main: '#f59e0b', // Amber 500
    },
    error: {
      main: '#ef4444', // Rose 500
    },
    text: {
      primary: '#f1f5f9', // Slate 100
      secondary: '#94a3b8', // Slate 400
    },
  },
  typography: {fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', },components: {MuiCssBaseline: {styleOverrides: `
        body {
          overflow-x: hidden;
          background-attachment: fixed;
        }
        /* Custom scrollbar for diagnostic logs */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.4);
        }

      `,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: '24px',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '1px',
          padding: '10px 20px',
        },
      },

    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          padding: '16px 20px',
        },
        head: {
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          fontSize: '11px',
          letterSpacing: '1px',
        },
      },
    },
  },
});

export default function AdminECommerce() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'contracts' | 'promotions' | 'support'>('overview');

  
  // Realtime Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromotionCode[]>([]);
  const [ispLogs, setIspLogs] = useState<ISPLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);

  // Form States for adding products
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpeed, setNewSpeed] = useState('');
  const [newPrice, setNewPrice] = useState(299);

  const [newType, setNewType] = useState<'Fibre' | 'LTE' | 'Mesh Wi-Fi'>('Fibre');
  const [newDesc, setNewDesc] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  // Edit Product Modal / Row Mode
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSpeed, setEditSpeed] = useState<string>('');

  // Form States for adding subscribers
  const [showAddSubForm, setShowAddSubForm] = useState(false);
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPlan, setSubPlan] = useState('');
  const [subAmount, setSubAmount] = useState(399);

  // Form States for Promo Engine
  const [newPromoCode, setNewPromoCode] = 

useState('');
  const [newDiscount, setNewDiscount] = useState(10);

  // Form States for Logs Override Terminal
  const [customLog, setCustomLog] = useState('');
  const [logSource, setLogSource] = useState<'SYSTEM' | 'MERCHANT' | 'DISPATCH' | 'ADMIN'>('ADMIN');

  // Search filter for contracts/subscribers
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-dismiss Toast Notification Helper
  const showToast = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, severity });
  };

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    const unsubscribeProducts = onValue(ref(db, 'products'), (snapshot) => {

      const data = snapshot.val();
      setProducts(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });

    const unsubscribeSubscribers = onValue(ref(db, 'subscribers'), (snapshot) => {
      const data = snapshot.val();
      setSubscribers(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });

    const unsubscribePromos = onValue(ref(db, 'promotions'), (snapshot) => {
      const data = snapshot.val();
      setPromoCodes(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });

    const unsubscribeLogs = onValue(ref(db, 'isp_logs'), (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const formattedList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setIspLogs(formattedList.reverse().slice(0, 8));
      } else {
        setIspLogs([]);
      }
    });

    const unsubscribeTickets = onValue(ref(db, 'support_tickets'), (snapshot) => {
      const data = snapshot.val();
      setTickets(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSubscribers();
      unsubscribePromos();
      unsubscribeLogs();
      unsubscribeTickets();

    };
  }, []);

  // --- ACTIONS & MUTATIONS ---
  const writeLogEntry = async (msg: string, src: 'SYSTEM' | 'MERCHANT' | 'DISPATCH' | 'ADMIN') => {
    try {
      await set(push(ref(db, 'isp_logs')), {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        message: msg,
        source: src
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSpeed || !newDesc) return;

    try {
      await set(push(ref(db, 'products')), {
        name: newName,
        speed: newSpeed,
        price: Number(newPrice),
        type: newType,
        popular: isPopular,
        description: newDesc,
        inStock: true
      });
      await writeLogEntry(`Admin created a new bundle package: ${newName} (${newSpeed})`, 'ADMIN');
      showToast(`Successfully added plan: ${newName}`);
      resetProductForm();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const resetProductForm = () => {
    setNewName('');
    setNewSpeed('');

    setNewPrice(299);
    setNewType('Fibre');
    setNewDesc('');
    setIsPopular(false);
    setShowAddForm(false);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove package "${name}"?`)) return;

    try {
      await remove(ref(db, `products/${id}`));
      await writeLogEntry(`Admin removed bundle package: ${name}`, 'ADMIN');
      showToast(`Deleted ${name} package.`);
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const togglePopular = async (id: string, currentVal?: boolean) => {

    try {
      await update(ref(db, `products/${id}`), { popular: !currentVal });
      showToast("Updated package popularity indicator.");
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const toggleStockStatus = async (id: string, currentVal: boolean) => {
    try {
      await update(ref(db, `products/${id}`), { inStock: !currentVal });
      showToast("Toggled package stock routing status.");
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const saveProductInLine = async (id: string) => {
    try {

      await update(ref(db, `products/${id}`), {
        price: Number(editPrice),
        speed: editSpeed
      });
      setEditingProductId(null);
      showToast("Product speed and pricing updated successfully!");
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const togglePaymentStatus = async (subId: string, currentStatus: 'Paid' | 'Unpaid', name: string) => {
    try {
      const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
      await update(ref(db, `subscribers/${subId}`), { status: newStatus });
      await writeLogEntry(`Payment override: marked ${name} as ${newStatus}`, 'MERCHANT');
      showToast(`Account of ${name} marked as ${newStatus}.`);

    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subEmail || !subPlan) return;
    try {
      await set(push(ref(db, 'subscribers')), {
        name: subName,
        email: subEmail,
        accountNo: `TCH-${Math.floor(10000 + Math.random() * 90000)}-ZA`,
        plan: subPlan,
        amount: Number(subAmount),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Unpaid',
        registrationDate: new Date().toISOString().split('T')[0]
      });
      await writeLogEntry(`Subscribed client account generated: ${subName} (${subPlan})`, 'SYSTEM');
      showToast(`Subscriber ${subName} created successfully.`);
      setSubName('');
      setSubEmail('');
      setSubPlan('');
      setShowAddSubForm(false);
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleRemoveSubscriber = async (id: string, name: string) => {
    if (!window.confirm(`Terminate agreement contract with client "${name}"?`)) return;
    try {
      await remove(ref(db, `subscribers/${id}`));
      await writeLogEntry(`Contract terminated for client: ${name}`, 'SYSTEM');
      showToast(`Successfully deleted contract for ${name}.`);
    } catch (error: any) {

      showToast(error.message, 'error');
    }
  };

  const handleBatchPaidInvoices = async () => {
    if (!window.confirm("Perform administrative override to mark all client balances as Cleared / Paid?")) return;
    try {
      const updates: any = {};
      subscribers.forEach((sub) => {
        if (sub.status === 'Unpaid') {
          updates[`/subscribers/${sub.id}/status`] = 'Paid';
        }
      });
      await update(ref(db), updates);
      await writeLogEntry(`Batch process executed: Cleared overall monthly client ledger.`, 'MERCHANT');
      showToast("All customer invoices have been administrative-cleared.");
    } catch (error: any) {
      showToast(error.message, 'error');

    }
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode) return;
    try {
      await set(push(ref(db, 'promotions')), {
        code: newPromoCode.toUpperCase().replace(/\s+/g, ''),
        discountPercentage: Number(newDiscount),
        active: true
      });
      showToast(`Promotional code ${newPromoCode.toUpperCase()} configured.`);
      setNewPromoCode('');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const togglePromoActive = async (id: string, currentVal: boolean) => {

    try {
      await update(ref(db, `promotions/${id}`), { active: !currentVal });
      showToast("Voucher status adjusted successfully.");
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleDeletePromo = async (id: string) => {
    try {
      await remove(ref(db, `promotions/${id}`));
      showToast("Voucher removed from active inventory.");
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleCustomLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customLog) return;
    await writeLogEntry(customLog, logSource);
    setCustomLog('');
    showToast("System diagnostic note published.");
  };

  const handleResolveTicket = async (id: string, client: string) => {
    try {
      await update(ref(db, `support_tickets/${id}`), { status: 'Resolved' });
      await writeLogEntry(`Help Desk: resolved ticket for client: ${client}`, 'SYSTEM');
      showToast(`Support Ticket resolved for ${client}`);
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + 

encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "TCH_Product_Catalog_Export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Downloaded Product Schema Backups.");
  };

  const downloadAdminReport = (sub: Subscriber) => {
    const reportText = `
===================================================
      THE CONNECTION HUB - ADMIN PAYMENT PROOF
===================================================

Admin Override ID: ADM-TXN-${Math.floor(100000 + Math.random() * 900000)}
Account Holder:    ${sub.name}
Email Address:     ${sub.email}
Account Number:    ${sub.accountNo}
Associated Plan:   ${sub.plan}
Invoice Amount:    R ${sub.amount.toFixed(2)}
Payment Status:    ${sub.status.toUpperCase()}
Generated On:      ${new Date().toISOString().split('T')[0]}

This document acts as verified administrative evidence of payment.
The Connection Hub ISP Ltd.
===================================================
    `;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TCH_AdminReceipt_${sub.accountNo}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Administrative Invoice Downloaded");
  };

  // --- STATISTICAL CALCULATIONS ---
  const activeSubsCount = subscribers.length;
  const monthlyRevenue = subscribers.reduce((acc, curr) => acc + curr.amount, 0);

  const paidContractsCount = subscribers.filter(s => s.status === 'Paid').length;
  const percentCollected = activeSubsCount > 0 ? ((paidContractsCount / activeSubsCount) * 100).toFixed(0) : '0';
  const unpaidTotal = subscribers.filter(s => s.status === 'Unpaid').reduce((acc, curr) => acc + curr.amount, 0);
  const activePromosCount = promoCodes.filter(p => p.active).length;
  const openTicketsCount = tickets.filter(t => t.status === 'Open').length;

  const filteredSubscribers = subscribers.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.accountNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', pb: 8, position: 'relative', overflowX: 'hidden' }}>
        
        {/* 2026 GLOW EFFECTS */}
        <Box
          sx={{

            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'linear-gradient(to top right, rgba(6, 182, 212, 0.1), transparent)',
            filter: 'blur(160px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'linear-gradient(to bottom right, rgba(79, 70, 229, 0.1), transparent)',
            filter: 'blur(180px)',
            pointerEvents: 'none',

          }}
        />

        {/* HEADER NAVBAR */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backdropFilter: 'blur(12px)',
            bgcolor: 'rgba(7, 9, 19, 0.7)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            py: 2,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                <Box

                  sx={{
                    background: 'linear-gradient(to top right, #06b6d4, #4f46e5)',
                    p: 1.5,
                    borderRadius: '16px',
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': { transform: 'rotate(12deg)' },
                    transition: 'transform 0.3s',
                  }}
                >
                  <Wifi sx={{ color: '#000', fontSize: '24px' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
                    TCH Unified Admin Hub
                  </Typography>
                  <Chip
                    label="System Active • 2026 Standard"

                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontSize: '9px',
                      fontWeight: 'bold',
                      height: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mt: 0.5,
                    }}
                  />
                </Box>
              </Box>

              {/* TABS NAVIGATION */}
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.02)',

                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '18px',
                  p: 0.5,
                  minHeight: 'auto',
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                {(['overview', 'products', 'contracts', 'promotions', 'support'] as const).map((tab) => (
                  <Tab
                    key={tab}
                    value={tab}
                    label={
                      tab === 'promotions'
                        ? `Vouchers (${promoCodes.length})`
                        : tab === 'support'
                        ? `Tickets (${openTicketsCount})`
                        : tab
                    }
                    sx={{

                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      minHeight: 'auto',
                      px: 2,
                      py: 1.2,
                      borderRadius: '12px',
                      color: 'text.secondary',
                      transition: '0.3s',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: '#000',
                        boxShadow: '0 0 25px rgba(6, 182, 212, 0.35)',
                      },
                      '&:hover': {
                        color: 'text.primary',
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 6 }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* BENTO STATS GRID */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: 'rgba(6, 182, 212, 0.25)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 35px -10px rgba(6, 182, 212, 0.1)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}

                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary' }}>
                          Projected MRR
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
                          R {monthlyRevenue.toLocaleString()}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                          <TrendingUp sx={{ fontSize: '14px', color: 'primary.main' }} />
                          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '9px' }}>
                            LIVE REVENUE NODE
                          </Typography>

                        </Box>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px' }}>
                        <AttachMoney sx={{ color: 'primary.main' }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: 'rgba(16, 185, 129, 0.25)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 35px -10px rgba(16, 185, 129, 0.1)',

                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary' }}>
                          Active Subs
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
                          {activeSubsCount}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                          <CheckCircle sx={{ fontSize: '14px', color: 'success.main' }} />
                          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '9px' }}>

                            {paidContractsCount} INVOICES CLEAR
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                        <People sx={{ color: 'success.main' }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: 'rgba(239, 68, 68, 0.25)',
                        transform: 'translateY(-2px)',

                        boxShadow: '0 15px 35px -10px rgba(239, 68, 68, 0.1)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary' }}>
                          Outstanding
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'error.main', mt: 1 }}>
                          R {unpaidTotal.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5, fontSize: '9px' }}>
                          Efficiency at {percentCollected}%
                        </Typography>

                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
                        <CreditCard sx={{ color: 'error.main' }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: 'rgba(124, 58, 237, 0.25)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 35px -10px rgba(124, 58, 237, 0.1)',
                      },

                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary' }}>
                          Promo Reach
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', mt: 1 }}>
                          {activePromosCount} Active
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5, fontSize: '9px' }}>
                          Deployed vouchers
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '12px' }}>
                        <LocalOffer sx={{ color: 'secondary.main' }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* TELEMETRY & LOGGER SECTION */}
              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Analytics sx={{ color: 'primary.main' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Live Telemetry Logs

                        </Typography>
                      </Box>
                      <Chip label="Live Streaming" size="small" color="success" variant="outlined" sx={{ fontSize: '9px', fontWeight: 'bold', height: '20px' }} />
                    </Box>

                    <Box className="custom-scrollbar" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '320px', overflowY: 'auto', pr: 1 }}>
                      {ispLogs.map((log) => (
                        <Box
                          key={log.id}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.03)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            fontSize: '11px',

                            fontFamily: 'monospace',
                          }}
                        >
                          <Box>
                            <Typography component="span" sx={{ color: 'text.secondary', mr: 1, fontSize: '11px', fontFamily: 'monospace' }}>
                              [{log.timestamp}]
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                color:
                                  log.source === 'ADMIN' ? 'secondary.main' :
                                  log.source === 'SYSTEM' ? 'primary.main' :
                                  log.source === 'MERCHANT' ? 'success.main' : 'warning.main',
                                fontWeight: log.source === 'SYSTEM' ? 'bold' : 'normal',
                                fontSize: '11px',
                                fontFamily: 'monospace'
                              }}

                            >
                              {log.message}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {log.source}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Diagnostic Bypass Terminal
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>

                      Inject override parameters directly to live diagnostic streams for routine test events.
                    </Typography>

                    <form onSubmit={handleCustomLogSubmit}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Audit Stream Source</InputLabel>
                          <Select
                            value={logSource}
                            label="Audit Stream Source"
                            onChange={(e) => setLogSource(e.target.value as any)}
                            sx={{ borderRadius: '12px' }}
                          >
                            <option value="ADMIN">ADMIN Override</option>
                            <option value="SYSTEM">SYSTEM Daemon</option>
                            <option value="MERCHANT">MERCHANT Portal</option>

                            <option value="DISPATCH">DISPATCH Route</option>
                          </Select>
                        </FormControl>

                        <TextField
                          label="Payload Stream"
                          required
                          multiline
                          rows={3}
                          value={customLog}
                          onChange={(e) => setCustomLog(e.target.value)}
                          placeholder="e.g. Schedule manual system bypass route..."
                          fullWidth
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ textTransform: 'uppercase', py: 1.5 }}>

                          Inject Sequence
                        </Button>
                      </Box>
                    </form>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Products & Catalog</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage catalog configurations, toggle parameters, and export clean system structures.</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    onClick={handleExportJSON}
                    variant="outlined"
                    startIcon={<FilePresent />}
                    sx={{ textTransform: 'uppercase', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'text.primary', bgcolor: 'rgba(255, 255, 255, 0.01)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
                  >
                    Export JSON
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    sx={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}
                  >

                    {showAddForm ? 'Close Panel' : 'Publish Plan'}
                  </Button>
                </Box>
              </Box>

              {/* ADD PRODUCT FORM */}
              {showAddForm && (
                <Paper sx={{ p: 4, mt: 2 }}>
                  <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', pb: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesome color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Live Product Architect</Typography>
                  </Box>

                  <form onSubmit={handleAddProduct}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Package Name"
                          required

                          fullWidth
                          size="small"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Hyper-Fibre Ultimate"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Bandwidth / Speed Value"
                          required
                          fullWidth
                          size="small"
                          value={newSpeed}
                          onChange={(e) => setNewSpeed(e.target.value)}
                          placeholder="e.g. 500 Mbps"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Monthly Value (ZAR)"
                          required
                          type="number"
                          fullWidth
                          size="small"
                          value={newPrice}
                          onChange={(e) => setNewPrice(Number(e.target.value))}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Category Type</InputLabel>
                          <Select
                            value={newType}
                            label="Category Type"
                            onChange={(e) => setNewType(e.target.value as any)}

                            sx={{ borderRadius: '12px' }}
                          >
                            <MenuItem value="Fibre">Fibre</MenuItem>
                            <MenuItem value="LTE">LTE Wireless</MenuItem>
                            <MenuItem value="Mesh Wi-Fi">Mesh Systems</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <TextField
                          label="Marketing Tags & Specs"
                          required
                          fullWidth
                          size="small"
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="e.g. Unlimited uncapped data with free dynamic router routing..."
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)', p: 2, borderRadius: '16px' }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isPopular}
                                onChange={(e) => setIsPopular(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Flag product node as 'Best Value / Most Popular' in landing storefront view"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end', gap: 2 }}>
                        <Button onClick={resetProductForm} color="inherit" sx={{ fontWeight: 'bold' }}>
                          Discard Draft
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                          Commit to Database
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              )}

              {/* PRODUCT CATALOG GRID */}
              <Grid container spacing={3}>
                {products.map((prod) => (
                  <Grid item xs={12} md={6} lg={4} key={prod.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',

                        p: 3,
                        borderColor: prod.popular ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        position: 'relative',
                      }}
                    >
                      {prod.popular && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'rgba(6, 182, 212, 0.1)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            color: 'primary.main',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '12px',
                            letterSpacing: '1px',
                          }}

                        >
                          Popular
                        </Box>
                      )}

                      <CardContent sx={{ p: 0 }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', mb: 1, display: 'block' }}>
                          {prod.type}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {prod.name}
                        </Typography>

                        {editingProductId === prod.id ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                            <TextField

                              label="Speed Value"
                              size="small"
                              value={editSpeed}
                              onChange={(e) => setEditSpeed(e.target.value)}
                              fullWidth
                            />
                            <TextField
                              label="ZAR Value"
                              type="number"
                              size="small"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number(e.target.value))}
                              fullWidth
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
                              <Button size="small" color="inherit" onClick={() => setEditingProductId(null)}>Cancel</Button>
                              <Button size="small" variant="contained" color="primary" onClick={() => saveProductInLine(prod.id)}>Save</Button>

                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>
                              R {prod.price}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">/ mo</Typography>
                          </Box>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>
                          {prod.description}
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ p: 0, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                          size="small"
                          color="inherit"
                          startIcon={<Edit />}
                          onClick={() => {
                            setEditingProductId(prod.id);
                            setEditPrice(prod.price);
                            setEditSpeed(prod.speed);
                          }}
                        >
                          Edit
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Toggle Shop Feature">
                            <IconButton
                              size="small"
                              onClick={() => togglePopular(prod.id, prod.popular)}
                              sx={{
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: prod.popular ? 'primary.main' : 'text.secondary',
                                bgcolor: prod.popular ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                              }}
                            >
                              <AutoAwesome sx={{ fontSize: '18px' }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Toggle Live Stock Status">
                            <IconButton
                              size="small"
                              onClick={() => toggleStockStatus(prod.id, prod.inStock)}
                              sx={{
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: prod.inStock ? 'success.main' : 'error.main',
                                bgcolor: prod.inStock ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              }}

                            >
                              <CheckBox sx={{ fontSize: '18px' }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Package">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              sx={{ color: 'error.main', border: '1px solid rgba(239, 68, 68, 0.2)', bgcolor: 'rgba(239, 68, 68, 0.05)' }}
                            >
                              <Delete sx={{ fontSize: '18px' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

            </Box>
          )}

          {/* TAB 3: CONTRACTS & LEDGERS */}
          {activeTab === 'contracts' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: { lg: 'center' }, gap: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Contracts Ledger</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>View real-time subscriber contracts, download invoices, and toggle billing compliance.</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <TextField
                    size="small"

                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search query..."
                    InputProps={{
                      startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: '20px' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '16px' },
                      minWidth: '240px',
                    }}
                  />

                  <Button
                    onClick={handleBatchPaidInvoices}
                    variant="outlined"
                    color="success"
                    startIcon={<CheckCircle />}
                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)' }}
                  >
                    Clear Ledger

                  </Button>

                  <Button
                    onClick={() => setShowAddSubForm(!showAddSubForm)}
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                  >
                    Add Sub
                  </Button>
                </Box>
              </Box>

              {/* ADD SUBSCRIBER FORM */}
              {showAddSubForm && (
                <Paper sx={{ p: 4 }}>
                  <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', pb: 2, mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Create Customer Node</Typography>
                  </Box>

                  <form onSubmit={handleAddSubscriber}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Subscriber Name"
                          required
                          fullWidth
                          size="small"
                          value={subName}
                          onChange={(e) => setSubName(e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Email Address"
                          required
                          type="email"
                          fullWidth
                          size="small"
                          value={subEmail}

                          onChange={(e) => setSubEmail(e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Plan Node ID"
                          required
                          fullWidth
                          size="small"
                          value={subPlan}
                          onChange={(e) => setSubPlan(e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Invoice Cost"
                          required
                          type="number"

                          fullWidth
                          size="small"
                          value={subAmount}
                          onChange={(e) => setSubAmount(Number(e.target.value))}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end', gap: 2, mt: 1 }}>
                        <Button color="inherit" onClick={() => setShowAddSubForm(false)}>Discard</Button>
                        <Button type="submit" variant="contained" color="primary">Commit Subscriber</Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              )}

              {/* CONTRACTS TABLE */}
              <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Client Context</TableCell>
                      <TableCell>Network Tier</TableCell>
                      <TableCell>Cost Node</TableCell>
                      <TableCell>Compliance Status</TableCell>
                      <TableCell>Due Parameter</TableCell>
                      <TableCell align="right">Ledger Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSubscribers.map((sub) => (
                      <TableRow key={sub.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.01)' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{sub.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                            {sub.accountNo} • {sub.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>{sub.plan}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R {sub.amount}</Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => togglePaymentStatus(sub.id, sub.status, sub.name)}
                            color={sub.status === 'Paid' ? 'success' : 'error'}
                            sx={{
                              fontSize: '10px',

                              px: 1.5,
                              py: 0.5,
                              minWidth: 'auto',
                              borderRadius: '20px',
                              border: '1px solid',
                              bgcolor: sub.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            }}
                          >
                            {sub.status}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{sub.dueDate}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
                            <Tooltip title="Generate Receipt">
                              <IconButton
                                size="small"
                                onClick={() => downloadAdminReport(sub)}
                                sx={{ border: '1px solid rgba(255,255,255,0.05)', color: 'text.primary', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                              >
                                <Download sx={{ fontSize: '18px' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Contract">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveSubscriber(sub.id, sub.name)}
                                sx={{ color: 'error.main', border: '1px solid rgba(239, 68, 68, 0.2)', bgcolor: 'rgba(239, 68, 68, 0.05)' }}
                              >
                                <Delete sx={{ fontSize: '18px' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>

                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 4: PROMOTIONS */}
          {activeTab === 'promotions' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Voucher Engine</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                      Create promotional vouchers with customized discount percentage logic.
                    </Typography>

                    <form onSubmit={handleAddPromo}>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                          label="Voucher AlphaCode"
                          required
                          value={newPromoCode}
                          onChange={(e) => setNewPromoCode(e.target.value)}
                          placeholder="e.g. FLASH30"
                          fullWidth
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        <TextField
                          label="Discount Fraction (%)"
                          required
                          type="number"
                          value={newDiscount}
                          onChange={(e) => setNewDiscount(Number(e.target.value))}
                          inputProps={{ min: 5, max: 100 }}
                          fullWidth

                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
                          Register Code Node
                        </Button>
                      </Box>
                    </form>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 3 }}>Active Shop Discounts</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {promoCodes.map((promo) => (
                        <Box

                          key={promo.id}
                          sx={{
                            p: 2.5,
                            borderRadius: '16px',
                            bgcolor: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 900, color: 'primary.main', letterSpacing: '0.5px' }}>
                              {promo.code}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              Value discount: {promo.discountPercentage}% Off monthly tier
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                              size="small"
                              onClick={() => togglePromoActive(promo.id, promo.active)}
                              sx={{
                                fontSize: '10px',
                                py: 0.5,
                                px: 1.5,
                                borderRadius: '12px',
                                border: '1px solid',
                                color: promo.active ? 'primary.main' : 'text.secondary',
                                borderColor: promo.active ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.1)',
                                bgcolor: promo.active ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                              }}

                            >
                              {promo.active ? 'Active' : 'Disabled'}
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePromo(promo.id)}
                              sx={{ color: 'error.main', border: '1px solid rgba(239, 68, 68, 0.2)', bgcolor: 'rgba(239, 68, 68, 0.05)' }}
                            >
                              <Delete sx={{ fontSize: '16px' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 5: SUPPORT TICKETS */}
          {activeTab === 'support' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Interactive Help Desk</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>View customer service reports, issue resolutions, and diagnostic comments.</Typography>
              </Box>

              <Grid container spacing={3}>
                {tickets.map((ticket) => (
                  <Grid item xs={12} md={6} key={ticket.id}>
                    <Paper
                      sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',

                        height: '100%',
                        position: 'relative',
                        borderColor: ticket.status === 'Open' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      {ticket.status === 'Open' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: '8px',
                            height: '8px',
                            bgcolor: 'warning.main',
                            borderRadius: '50%',
                          }}
                        />
                      )}

                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>

                          <Chip
                            label={ticket.status}
                            size="small"
                            color={ticket.status === 'Open' ? 'warning' : 'success'}
                            variant="outlined"
                            sx={{ fontSize: '9px', fontWeight: 'bold', height: '20px' }}
                          />
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                            {ticket.clientName}
                          </Typography>
                        </Box>

                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {ticket.subject}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: '1.6' }}>
                          {ticket.message}

                        </Typography>
                      </Box>

                      {ticket.status === 'Open' && (
                        <Button
                          variant="contained"
                          color="success"
                          fullWidth
                          startIcon={<TaskAlt />}
                          onClick={() => handleResolveTicket(ticket.id, ticket.clientName)}
                          sx={{ color: '#000' }}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>


        {/* FEEDBACK TOAST SNACKBAR */}
        <Snackbar
          open={Boolean(toast)}
          autoHideDuration={4000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={toast?.severity || 'info'}
            onClose={() => setToast(null)}
            iconMapping={{
              success: <CheckCircle fontSize="small" />,
            }}
            sx={{
              bgcolor: 'background.paper',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '16px',
              color: 'text.primary',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'monospace',

              letterSpacing: '0.5px',
              boxShadow: '0 0 50px rgba(6, 182, 212, 0.15)',
            }}
          >
            {toast?.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
