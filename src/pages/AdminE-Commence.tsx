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
  Analytics,
  Edit,
  Download,
  Search,
  CheckCircle,
  AttachMoney,
  TaskAlt,
  Place
} from '@mui/icons-material';

// --- FIREBASE IMPORT ---
import { db } from '../firebase'; // Import your configured Firebase Database instance
import { ref, onValue, set, push, remove, update } from 'firebase/database';

// --- TYPES & INTERFACES (SYNCHRONIZED WITH E-COMMERCE CLIENT) ---
interface Product {
  id: string;
  name: string;
  speed: string;
  uploadSpeed?: string;
  price: number;
  type: 'Fibre' | 'LTE' | 'Mesh Wi-Fi';
  dataAllowance?: string;
  installationFee?: string;
  routerInfo?: string;
  contractType?: string;
  popular?: boolean;
  description: string;
  inStock?: boolean;
}

interface OrderRecord {
  id: string;
  transactionId: string;
  accountNo: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceAddress: string;
  paymentMethod: string;
  amountPaid: number;
  status: 'Order Received' | 'Installation Scheduled' | 'Technician Assigned' | 'Technician On The Way' | 'Installation Active' | 'Line Activated' | 'Cancelled';
  trackingStepIndex: number;
  installationDate: string;
  installationSlot: string;
}

interface SupportTicket {
  id: string;
  ticketNumber?: string;
  clientName?: string;
  customerEmail?: string;
  subject?: string;
  issueType?: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  message?: string;
  date?: string;
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

interface CoverageLead {
  id: string;
  street: string;
  suburb: string;
  city: string;
  postalCode: string;
  available: boolean;
  timestamp: string;
}

const TRACKING_STEPS = [
  'Order Received',
  'Installation Scheduled',
  'Technician Assigned',
  'Technician On The Way',
  'Installation Active',
  'Line Activated'
];

// --- MUI WHITE BACKGROUND / LIGHT THEME CREATION ---
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Indigo Blue
    },
    secondary: {
      main: '#0284c7', // Sky Blue
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
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
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          overflow-x: hidden;
          background-color: #ffffff;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(37, 99, 235, 0.3);
          border-radius: 4px;
        }
      `,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          fontWeight: 700,
          padding: '10px 20px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '16px 20px',
        },
        head: {
          fontWeight: 700,
          color: '#475569',
          textTransform: 'uppercase',
          fontSize: '11px',
          letterSpacing: '1px',
        },
      },
    },
  },
});

export default function AdminECommerce() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'promotions' | 'support' | 'leads'>('overview');

  // Realtime Database States (Synchronized with E-Commerce)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromotionCode[]>([]);
  const [ispLogs, setIspLogs] = useState<ISPLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [coverageLeads, setCoverageLeads] = useState<CoverageLead[]>([]);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);

  // Form States for adding products
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpeed, setNewSpeed] = useState('');
  const [newUploadSpeed, setNewUploadSpeed] = useState('');
  const [newPrice, setNewPrice] = useState(695);
  const [newType, setNewType] = useState<'Fibre' | 'LTE' | 'Mesh Wi-Fi'>('Fibre');
  const [newRouter, setNewRouter] = useState('Wi-Fi 6 Smart Router');
  const [newDesc, setNewDesc] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  // Edit Product Mode
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSpeed, setEditSpeed] = useState<string>('');

  // Form States for Promo Engine
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);

  // Form States for Logs
  const [customLog, setCustomLog] = useState('');
  const [logSource, setLogSource] = useState<'SYSTEM' | 'MERCHANT' | 'DISPATCH' | 'ADMIN'>('ADMIN');

  // Search filter
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

    const unsubscribeOrders = onValue(ref(db, 'contractOrders'), (snapshot) => {
      const data = snapshot.val();
      setOrders(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
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

    const unsubscribeTickets = onValue(ref(db, 'supportTickets'), (snapshot) => {
      const data = snapshot.val();
      setTickets(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });

    const unsubscribeLeads = onValue(ref(db, 'leads/coverageChecks'), (snapshot) => {
      const data = snapshot.val();
      setCoverageLeads(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribePromos();
      unsubscribeLogs();
      unsubscribeTickets();
      unsubscribeLeads();
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
        uploadSpeed: newUploadSpeed || `${parseInt(newSpeed) / 2} Mbps`,
        price: Number(newPrice),
        type: newType,
        dataAllowance: 'Uncapped',
        installationFee: 'Free Standard',
        routerInfo: newRouter,
        contractType: 'Month-to-Month',
        popular: isPopular,
        description: newDesc,
        inStock: true
      });
      await writeLogEntry(`Admin created package: ${newName} (${newSpeed})`, 'ADMIN');
      showToast(`Successfully added package: ${newName}`);
      resetProductForm();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const resetProductForm = () => {
    setNewName('');
    setNewSpeed('');
    setNewUploadSpeed('');
    setNewPrice(695);
    setNewType('Fibre');
    setNewRouter('Wi-Fi 6 Smart Router');
    setNewDesc('');
    setIsPopular(false);
    setShowAddForm(false);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove package "${name}"?`)) return;

    try {
      await remove(ref(db, `products/${id}`));
      await writeLogEntry(`Admin removed package: ${name}`, 'ADMIN');
      showToast(`Deleted ${name} package.`);
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
      showToast("Package updated successfully!");
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStepIndex: number) => {
    try {
      const statusName = TRACKING_STEPS[newStepIndex] || 'Line Activated';
      await update(ref(db, `contractOrders/${orderId}`), {
        trackingStepIndex: newStepIndex,
        status: statusName
      });
      await writeLogEntry(`Order #${orderId} tracking updated to: ${statusName}`, 'DISPATCH');
      showToast(`Order status updated to ${statusName}`);
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleRemoveOrder = async (id: string, customer: string) => {
    if (!window.confirm(`Cancel order for client "${customer}"?`)) return;
    try {
      await remove(ref(db, `contractOrders/${id}`));
      await writeLogEntry(`Order cancelled for client: ${customer}`, 'SYSTEM');
      showToast(`Successfully removed order for ${customer}.`);
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleResolveTicket = async (id: string) => {
    try {
      await update(ref(db, `supportTickets/${id}`), { status: 'Resolved' });
      await writeLogEntry(`Support Desk: Ticket resolved (${id})`, 'SYSTEM');
      showToast(`Support Ticket resolved!`);
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
      showToast(`Voucher ${newPromoCode.toUpperCase()} configured.`);
      setNewPromoCode('');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const downloadOrderReceipt = (order: OrderRecord) => {
    const reportText = `
===================================================
      THE CONNECTION HUB - ADMIN ORDER PROOF
===================================================

Transaction Ref:       ${order.transactionId}
Account Holder:        ${order.customerName}
Email Address:         ${order.customerEmail}
Phone Number:          ${order.customerPhone}
Account Number:        ${order.accountNo}
Installation Address:  ${order.serviceAddress}

--- SERVICE DETAILS ---
Scheduled Date:    ${order.installationDate} (${order.installationSlot})
Amount Paid:       R ${order.amountPaid.toFixed(2)}
Payment Method:    ${order.paymentMethod}
Status:            ${order.status}
Generated On:      ${new Date().toISOString().split('T')[0]}

Verified administrative document.
The Connection Hub ISP Ltd.
===================================================
    `;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TCH_OrderReceipt_${order.transactionId}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Administrative Order Proof Downloaded");
  };

  // --- STATISTICAL CALCULATIONS ---
  const activeOrdersCount = orders.length;
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
  const openTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const coverageCheckCount = coverageLeads.length;

  const filteredOrders = orders.filter(ord =>
    (ord.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ord.accountNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ord.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ord.serviceAddress || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', pb: 8, position: 'relative', bgcolor: '#ffffff' }}>
        
        {/* HEADER NAVBAR */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backdropFilter: 'blur(12px)',
            bgcolor: 'rgba(255, 255, 255, 0.85)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            py: 2,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb, #0284c7)',
                    p: 1.5,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Wifi sx={{ color: '#fff', fontSize: '24px' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.5px', color: '#0f172a' }}>
                    TCH Unified Admin Hub
                  </Typography>
                  <Chip
                    label="Fibre Live Core • Synchronized"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '9px', fontWeight: 'bold', height: '20px', textTransform: 'uppercase' }}
                  />
                </Box>
              </Box>

              {/* TABS NAVIGATION */}
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '18px',
                  p: 0.5,
                }}
              >
                {(['overview', 'products', 'orders', 'promotions', 'support', 'leads'] as const).map((tab) => (
                  <Tab
                    key={tab}
                    value={tab}
                    label={
                      tab === 'orders'
                        ? `Orders (${orders.length})`
                        : tab === 'support'
                        ? `Tickets (${openTicketsCount})`
                        : tab === 'leads'
                        ? `Coverage (${coverageCheckCount})`
                        : tab
                    }
                    sx={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      minHeight: 'auto',
                      px: 2,
                      py: 1.2,
                      borderRadius: '12px',
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 5 }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {/* BENTO STATS GRID */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary' }}>
                          Contract Revenue
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
                          R {totalRevenue.toLocaleString()}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                          <TrendingUp sx={{ fontSize: '14px', color: 'primary.main' }} />
                          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '9px' }}>
                            REAL-TIME SYNCED
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px' }}>
                        <AttachMoney sx={{ color: 'primary.main' }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary' }}>
                          Fibre Orders
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
                          {activeOrdersCount}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                          <CheckCircle sx={{ fontSize: '14px', color: 'success.main' }} />
                          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '9px' }}>
                            ACTIVE CONTRACTS
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                        <People sx={{ color: 'success.main' }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary' }}>
                          Open Desk Tickets
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: openTicketsCount > 0 ? 'warning.main' : 'text.primary', mt: 1 }}>
                          {openTicketsCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5, fontSize: '9px' }}>
                          Requires Attention
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                        <TaskAlt sx={{ color: 'warning.main' }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary' }}>
                          Coverage Checks
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', mt: 1 }}>
                          {coverageCheckCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5, fontSize: '9px' }}>
                          GIS Searches
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'rgba(2, 132, 199, 0.1)', borderRadius: '12px' }}>
                        <Place sx={{ color: 'secondary.main' }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* LIVE TELEMETRY LOGS */}
              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Analytics sx={{ color: 'primary.main' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Real-time System Audit Telemetry
                        </Typography>
                      </Box>
                      <Chip label="Live Stream" size="small" color="success" variant="outlined" sx={{ fontSize: '9px', fontWeight: 'bold' }} />
                    </Box>

                    <Box className="custom-scrollbar" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '320px', overflowY: 'auto' }}>
                      {ispLogs.map((log) => (
                        <Box
                          key={log.id}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                            border: '1px solid rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            [{log.timestamp}] <span style={{ color: '#0284c7', fontWeight: 600 }}>{log.message}</span>
                          </Typography>
                          <Chip label={log.source} size="small" sx={{ fontSize: '8px', height: '18px' }} />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Diagnostic Override Terminal
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                      Publish logs to live system feeds.
                    </Typography>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (customLog) {
                        writeLogEntry(customLog, logSource);
                        setCustomLog('');
                        showToast("Log entry posted.");
                      }
                    }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Source</InputLabel>
                          <Select
                            value={logSource}
                            label="Source"
                            onChange={(e) => setLogSource(e.target.value as any)}
                          >
                            <MenuItem value="ADMIN">ADMIN Override</MenuItem>
                            <MenuItem value="SYSTEM">SYSTEM Daemon</MenuItem>
                            <MenuItem value="MERCHANT">MERCHANT Portal</MenuItem>
                            <MenuItem value="DISPATCH">DISPATCH Route</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          label="Log Message"
                          required
                          multiline
                          rows={3}
                          value={customLog}
                          onChange={(e) => setCustomLog(e.target.value)}
                          size="small"
                        />

                        <Button type="submit" variant="contained" color="primary" fullWidth>
                          Publish Entry
                        </Button>
                      </Box>
                    </form>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Fibre Products Catalog</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Updates here reflect instantly on the public storefront.</Typography>
                </Box>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                >
                  {showAddForm ? 'Close Architect' : 'Add New Plan'}
                </Button>
              </Box>

              {/* ADD PRODUCT FORM */}
              {showAddForm && (
                <Paper sx={{ p: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Deploy New Package to Storefront
                  </Typography>

                  <form onSubmit={handleAddProduct}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField label="Package Name" required fullWidth size="small" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Telkom FTTH Core 50 Mbps" />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField label="Download Speed" required fullWidth size="small" value={newSpeed} onChange={(e) => setNewSpeed(e.target.value)} placeholder="e.g. 50 Mbps" />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField label="Upload Speed" fullWidth size="small" value={newUploadSpeed} onChange={(e) => setNewUploadSpeed(e.target.value)} placeholder="e.g. 25 Mbps" />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField label="Monthly Price (ZAR)" required type="number" fullWidth size="small" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField label="Router Bundle" fullWidth size="small" value={newRouter} onChange={(e) => setNewRouter(e.target.value)} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select value={newType} label="Type" onChange={(e) => setNewType(e.target.value as any)}>
                            <MenuItem value="Fibre">Fibre</MenuItem>
                            <MenuItem value="LTE">LTE Wireless</MenuItem>
                            <MenuItem value="Mesh Wi-Fi">Mesh Systems</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField label="Package Description" required fullWidth multiline rows={2} size="small" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Checkbox checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} color="primary" />}
                          label="Highlight as 'POPULAR CHOICE' badge on storefront"
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end', gap: 2 }}>
                        <Button onClick={resetProductForm} color="inherit">Discard</Button>
                        <Button type="submit" variant="contained" color="primary">Publish to Realtime DB</Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              )}

              {/* PRODUCTS GRID */}
              <Grid container spacing={3}>
                {products.map((prod) => (
                  <Grid item xs={12} md={6} lg={4} key={prod.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3, position: 'relative' }}>
                      {prod.popular && (
                        <Chip label="POPULAR" color="primary" size="small" sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 'bold' }} />
                      )}

                      <CardContent sx={{ p: 0 }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {prod.type}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                          {prod.name}
                        </Typography>

                        {editingProductId === prod.id ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 2 }}>
                            <TextField label="Speed" size="small" value={editSpeed} onChange={(e) => setEditSpeed(e.target.value)} fullWidth />
                            <TextField label="Price (ZAR)" type="number" size="small" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} fullWidth />
                            <Button size="small" variant="contained" onClick={() => saveProductInLine(prod.id)}>Save Changes</Button>
                          </Box>
                        ) : (
                          <Box sx={{ my: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>
                              R {prod.price} <span style={{ fontSize: '14px', color: '#64748b' }}>/pm</span>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Speed: {prod.speed} {prod.uploadSpeed ? `| Up: ${prod.uploadSpeed}` : ''}
                            </Typography>
                          </Box>
                        )}

                        <Typography variant="body2" color="text.secondary">
                          {prod.description}
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ p: 0, pt: 3, display: 'flex', justifyContent: 'space-between' }}>
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

                        <IconButton size="small" color="error" onClick={() => handleDeleteProduct(prod.id, prod.name)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* TAB 3: ORDERS & CONTRACTS */}
          {activeTab === 'orders' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Client Contract Orders</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Track installation stages and customer contracts submitted through checkout.</Typography>
                </Box>

                <TextField
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer, account or address..."
                  InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  sx={{ minWidth: 280 }}
                />
              </Box>

              {/* ORDERS TABLE */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer Details</TableCell>
                      <TableCell>Address & Slot</TableCell>
                      <TableCell>Amount & Method</TableCell>
                      <TableCell>Progress Stage</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((ord) => (
                      <TableRow key={ord.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{ord.customerName}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontFamily: 'monospace' }}>
                            Acc: {ord.accountNo} | Ref: {ord.transactionId}
                          </Typography>
                          <Typography variant="caption" color="primary">{ord.customerEmail}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '12px' }}>{ord.serviceAddress}</Typography>
                          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            Sched: {ord.installationDate} ({ord.installationSlot})
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R {ord.amountPaid?.toFixed(2)}</Typography>
                          <Chip label={ord.paymentMethod} size="small" variant="outlined" sx={{ fontSize: '9px', height: '18px' }} />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 180 }}>
                            <Select
                              value={ord.trackingStepIndex !== undefined ? ord.trackingStepIndex : 0}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, Number(e.target.value))}
                              sx={{ fontSize: '12px', borderRadius: '12px' }}
                            >
                              {TRACKING_STEPS.map((stepName, idx) => (
                                <MenuItem key={idx} value={idx}>
                                  {idx + 1}. {stepName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
                            <Tooltip title="Download Proof Document">
                              <IconButton size="small" onClick={() => downloadOrderReceipt(ord)}>
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Contract Order">
                              <IconButton size="small" color="error" onClick={() => handleRemoveOrder(ord.id, ord.customerName)}>
                                <Delete fontSize="small" />
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Promotional Voucher Engine</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                      Configured discount codes apply to public cart checkout.
                    </Typography>

                    <form onSubmit={handleAddPromo}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="Voucher Code"
                          required
                          value={newPromoCode}
                          onChange={(e) => setNewPromoCode(e.target.value)}
                          placeholder="e.g. FIBRE50"
                          size="small"
                        />
                        <TextField
                          label="Discount Percentage (%)"
                          required
                          type="number"
                          value={newDiscount}
                          onChange={(e) => setNewDiscount(Number(e.target.value))}
                          size="small"
                        />
                        <Button type="submit" variant="contained" color="primary">
                          Register Voucher
                        </Button>
                      </Box>
                    </form>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 3 }}>Active Vouchers</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {promoCodes.map((promo) => (
                        <Box
                          key={promo.id}
                          sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', fontFamily: 'monospace' }}>
                              {promo.code}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {promo.discountPercentage}% Discount
                            </Typography>
                          </Box>
                          <IconButton size="small" color="error" onClick={async () => {
                            await remove(ref(db, `promotions/${promo.id}`));
                            showToast("Voucher removed.");
                          }}>
                            <Delete fontSize="small" />
                          </IconButton>
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
              <Typography variant="h5" sx={{ fontWeight: 900 }}>Customer Support Tickets</Typography>

              <Grid container spacing={3}>
                {tickets.map((t) => (
                  <Grid item xs={12} md={6} key={t.id}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Chip label={t.status} color={t.status === 'Open' ? 'warning' : 'success'} size="small" />
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                            {t.ticketNumber || t.id}
                          </Typography>
                        </Box>

                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Issue: {t.issueType || t.subject || 'Technical Support'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t.message || 'Customer reported a service interruption on their Fibre line.'}
                        </Typography>
                      </Box>

                      {t.status !== 'Resolved' && (
                        <Button variant="contained" color="success" size="small" onClick={() => handleResolveTicket(t.id)}>
                          Mark Ticket Resolved
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* TAB 6: COVERAGE LEADS */}
          {activeTab === 'leads' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>OpenServe GIS Coverage Leads</Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address Query</TableCell>
                      <TableCell>Suburb & City</TableCell>
                      <TableCell>Availability Status</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coverageLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{lead.street}</TableCell>
                        <TableCell>{lead.suburb}, {lead.city || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={lead.available ? 'Fibre Available' : 'No Coverage'}
                            color={lead.available ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '11px' }}>{lead.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
          <Alert severity={toast?.severity || 'info'} onClose={() => setToast(null)}>
            {toast?.message}
          </Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
}