
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Badge,

  Tooltip,
  Stack,
  Avatar,
  Divider
} from "@mui/material";

import {
  Search,
  Phone,
  Email,
  WhatsApp,
  CheckCircle,
  Pending,
  Delete,
  Visibility,
  Paid,
  Assignment,
  Refresh,
  Notifications,
  Download,

  Person,
  Business,
  AccountBalance,
  LocationOn,
  Wifi,
  CloudDownload,
  Close,
  TrendingUp,
  Map,
  NetworkCheck,
  Speed,
  Shield,
  Event,
  Timer,
  AttachMoney,
  VerifiedUser,
  Contacts,
  FactCheck,
  Co2
} from "@mui/icons-material";

import { motion} from "framer-motion";


import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import {
  ref,
  onValue,

  update,
  remove
} from "firebase/database";

import { db } from "../firebase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

const AdminContractFibreLeads = () => {

  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const [yearFilter, setYearFilter] = useState("");

  // UI Interactive Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<any>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  
  // State consolidation fix
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<any | null>(null);
  const [ViewDialogOpen, setViewDialogOpen] = useState<boolean>(false);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [leadToReject, setLeadToReject] = useState<any>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch Database Hook - Leads
  useEffect(() => {
    const unsub = onValue(ref(db, "contractFibreLeads"), snap => {
      const data = snap.val();
      if (data) {
        setLeads(
          Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).reverse()
        );
      } else {
        setLeads([]);
      }
    });
    return () => unsub();
  }, []);

  // Fetch Database Hook - Agents
  useEffect(() => {
    const unsub = onValue(ref(db, "agents"), snap => {
      const data = snap.val();
      if (data) {
        setAgents(
          Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }))
        );
      } else {
        setAgents([]);
      }
    });
    return () => unsub();
  }, []);

  // Search & Multiple Filtering pipeline
  const filteredLeads = useMemo(() => {
    return leads.filter((lead: any) => {
      const packageSearch = lead.packageName || lead.packagePlan || "";

      const text = `
      ${lead.firstName || ""}
      ${lead.lastName || ""}
      ${lead.phone || ""}
      ${lead.email || ""}
      ${lead.address || ""}
      ${lead.idNumber || ""}
      ${lead.agentName || lead.technicianOrAgent || ""}
      ${packageSearch}
      `.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesAgent = agentFilter === "" || lead.agentName === agentFilter || lead.technicianOrAgent === agentFilter;
      const matchesStatus = statusFilter === "" || (lead.adminStatus || "Pending") === statusFilter;
      
      const createdDate = lead.createdAt ? new Date(lead.createdAt) : null;
      const matchesMonth = monthFilter === "" || (createdDate && createdDate.getMonth() === Number(monthFilter));
      const matchesYear = yearFilter === "" || (createdDate && createdDate.getFullYear() === Number(yearFilter));

      return matchesSearch && matchesAgent && matchesStatus && matchesMonth && matchesYear;
    });
  }, [leads, search, agentFilter, statusFilter, monthFilter, yearFilter]);

  // Dynamic Statistics Computations
  const totalApplications = filteredLeads.length;
  const approved = filteredLeads.filter(x => x.adminStatus === "Approved").length;
  const pending = filteredLeads.filter(x => !x.adminStatus || x.adminStatus === "Pending").length;
  const rejected = filteredLeads.filter(x => x.adminStatus === "Rejected").length;
  
  // Calculate potential contract revenue value
  const revenue = filteredLeads.reduce((acc, current) => {
    if (current.adminStatus === "Approved") {
      const cleanPrice = String(current.monthlyPrice || "").replace(/[^0-9]/g, "");
      return acc + (cleanPrice ? parseInt(cleanPrice, 10) : 695);
    }
    return acc;
  }, 0);

  // Performance breakdown
  const performanceData = useMemo(() => {
    return agents.map((agent: any) => {
      const list = filteredLeads.filter(x => x.agentName === agent.name || x.technicianOrAgent === agent.name);
      return {
        agent: agent.name,
        Applications: list.length,
        Approved: list.filter(x => x.adminStatus === "Approved").length,
      };
    });

  }, [agents, filteredLeads]);

  const pieData = [
    { name: "Approved", value: approved },
    { name: "Pending", value: pending },
    { name: "Rejected", value: rejected }
  ];

  // Professional Messaging Engine for status communication templates
  const dispatchProfessionalAlerts = (lead: any, status: string, customReason?: string) => {
    const formatNumber = "27" + lead.phone.replace(/^0/, "");
    const clientName = `${lead.firstName} ${lead.lastName}`;
    
    let subject = `APPLICATION UPDATE: OpenServe Contract Fibre Application Approved`;
    let emailMessage = `Dear ${clientName},\n\nWe are pleased to inform you that your OpenServe Contract Fibre application has been successfully APPROVED. Your order is now being processed for network provisioning.\n\nOur assigned installation technician will contact you shortly to schedule an appointment.\n\nBest regards,\nOpenServe Administrations`;
    let waMessage = `*OpenServe Fibre Application Approved* 🚀\n\nDear ${clientName}, your application has been successfully Approved. A provisioning technician will make contact with you soon. Thank you.`;

    if (status === "Rejected") {
      subject = `APPLICATION STATUS OUTCOME: OpenServe Contract Fibre Application`;
      const reasonDetail = customReason || "We regret to tell you that there is no coverage at your place.";
      emailMessage = `Dear ${clientName},\n\nThank you for your interest in OpenServe Contract Fibre.\n\nFollowing a formal verification of your profile, we regret to inform you that your application could not be approved due to the following reasons:\n- ${reasonDetail}\n\nIf you have questions regarding this assessment, please contact pitsok@telkom.co.za.\n\nBest regards,\nOpenServe Administrations`;

      waMessage = `*OpenServe Fibre Application Update* ⚠️\n\nDear ${clientName}, your application status has been processed: *Rejected*.\nReason: ${reasonDetail}`;
    } else if (status === "Pending") {
      subject = `APPLICATION UPDATE: OpenServe Contract Fibre Application Pending`;
      emailMessage = `Dear ${clientName},\n\nYour contract application profile is currently undergoing verification checks.\n\nShould we require additional documents, a dedicated support desk agent will reach out directly.\n\nBest regards,\nOpenServe Administrations`;
      waMessage = `*OpenServe Fibre Application Update* ⏱️\n\nDear ${clientName}, your application is currently under *Pending Review* status. We will keep you updated.`;
    }

    const whatsappUrl = `https://wa.me/${formatNumber}?text=${encodeURIComponent(waMessage)}`;
    window.open(whatsappUrl, "_blank");

    const mailtoUrl = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailMessage)}`;
    window.location.href = mailtoUrl;
  };

  // Status handlers
  const handleStatusApprove = (lead: any) => {
    update(ref(db, `contractFibreLeads/${lead.id}`), {
      adminStatus: "Approved",
      approvedDate: new Date().toISOString()
    }).then(() => {
      dispatchProfessionalAlerts(lead, "Approved");
    });
  };

  // Fix: Assign to view dialog variables
  const openLead = (lead: any) => {
    setSelectedLeadDetails(lead);
    setViewDialogOpen(true);
  };

  const handleStatusPending = (lead: any) => {
    update(ref(db, `contractFibreLeads/${lead.id}`), {
      adminStatus: "Pending"
    }).then(() => {
      dispatchProfessionalAlerts(lead, "Pending");
    });
  };

  const initiateRejection = (lead: any) => {
    setLeadToReject(lead);
    setRejectDialogOpen(true);
  };

  const executeRejection = (reason: string) => {
    if (!leadToReject) return;
    update(ref(db, `contractFibreLeads/${leadToReject.id}`), {
      adminStatus: "Rejected",
      rejectionReason: reason
    }).then(() => {
      dispatchProfessionalAlerts(leadToReject, "Rejected", reason);
      setRejectDialogOpen(false);

      setLeadToReject(null);
    });
  };

  // Assign agent helper
  const handleAgentChange = (leadId: string, agentName: string) => {
    update(ref(db, `contractFibreLeads/${leadId}`), {
      agentName: agentName,
      technicianOrAgent: agentName
    });
  };

  // Safe delete routines
  const openDeletePrompt = (lead: any) => {
    setLeadToDelete(lead);
    setConfirmNameInput("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmedDelete = () => {
    if (leadToDelete && confirmNameInput === `${leadToDelete.firstName} ${leadToDelete.lastName}`) {
      remove(ref(db, `contractFibreLeads/${leadToDelete.id}`)).then(() => {
        setDeleteDialogOpen(false);
        setLeadToDelete(null);
      });
    }
  };

  // Document base64 downloader dispatcher
  const downloadBase64File = (base64String: string, defaultFilename: string) => {
    if (!base64String) {
      alert("No uploaded document base64 data detected.");
      return;
    }
    try {
      const parts = base64String.split(";base64,");
      const contentType = parts[0].split(":")[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);


      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });
      saveAs(blob, defaultFilename);
    } catch (e) {
      alert("Error generating download. Base64 format could be corrupt or incomplete.");
    }
  };

  // Dynamic calculations for the +10 2026 Admin Panel features
  const calculateCommission = (priceStr: string) => {
    const cleanPrice = String(priceStr || "").replace(/[^0-9]/g, "");
    const baseValue = cleanPrice ? parseInt(cleanPrice, 10) : 695;
    return Math.floor(baseValue * 0.15); // 15% Agent Commission

  };

  const calculateEarlyTerminationFee = (priceStr: string) => {
    const cleanPrice = String(priceStr || "").replace(/[^0-9]/g, "");
    const baseValue = cleanPrice ? parseInt(cleanPrice, 10) : 695;
    return baseValue * 12; // Flat 12 months fee
  };

  // Export Sheet Center
  const handleExportToExcel = () => {
    const exportData = filteredLeads.map(l => ({
      ID: l.id,
      FullName: `${l.firstName} ${l.lastName}`,
      ID_Number: l.idNumber,
      Phone: l.phone,
      Email: l.email,
      Address: `${l.address}, ${l.suburb || ""}, ${l.city || ""}, ${l.province || ""}`,
      Package: l.packageName || l.packagePlan || "",
      Price: l.monthlyPrice || "",
      AssignedAgent: l.agentName || l.technicianOrAgent || "Unassigned",
      Company: l.companyName || "",
      NetIncome: l.netIncome || "",
      Expenses: l.totalExpenses || "",
      PaymentMethod: l.paymentMethod || "",
      Status: l.adminStatus || "Pending",
      CreatedDate: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads Report");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(file, `ContractFibreLeads_2026.xlsx`);
  };

  return (

    <Box sx={styles.page}>
      {/* Dynamic Blur Elements */}
      <Box sx={styles.background}>
        <motion.div animate={{ x: [0, 80, 0], y: [0, -60, 0] }} transition={{ duration: 14, repeat: Infinity }} style={styles.circle1} />
        <motion.div animate={{ x: [0, -120, 0], y: [0, 80, 0] }} transition={{ duration: 18, repeat: Infinity }} style={styles.circle2} />
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity }} style={styles.circle3} />
      </Box>

      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Paper sx={styles.headerCard}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography sx={styles.title}>
                OpenServe Contract Fibre Leads

              </Typography>
              <Typography sx={styles.subtitle}>
                2026 Contract Fibre Administration Dashboard • Sync with live registrations, coordinate mappings, document audits, and automated service provisions.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={styles.headerRight}>
                <Badge badgeContent={pending} color="error">
                  <Notifications sx={{ fontSize: 45, color: "#fff" }} />
                </Badge>
                <Typography fontWeight={700} color="white">
                  {pending} Pending Reviews
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>


      {/* KPI METRIC MATRIX */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={3}>
          <Paper sx={styles.summaryCard}>
            <Assignment sx={styles.summaryIcon} />
            <Typography color="textSecondary" fontWeight="bold">Total Leads</Typography>
            <Typography sx={styles.summaryValue}>{totalApplications}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={styles.summaryCard}>
            <CheckCircle sx={{ ...styles.summaryIcon, color: "#22c55e" }} />
            <Typography color="textSecondary" fontWeight="bold">Approved Orders</Typography>
            <Typography sx={styles.summaryValue}>{approved}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>

          <Paper sx={styles.summaryCard}>
            <Pending sx={{ ...styles.summaryIcon, color: "#f59e0b" }} />
            <Typography color="textSecondary" fontWeight="bold">Awaiting Vet</Typography>
            <Typography sx={styles.summaryValue}>{pending}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={styles.summaryCard}>
            <Paid sx={{ ...styles.summaryIcon, color: "#00bcd4" }} />
            <Typography color="textSecondary" fontWeight="bold">Monthly Value</Typography>
            <Typography sx={styles.summaryValue}>R {revenue.toLocaleString()}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ANALYTICS CHARTS */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>

          <Paper sx={styles.glassCard}>
            <Typography variant="h6" fontWeight={700} mb={2}>Applications Funnel</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={styles.glassCard}>
            <Typography variant="h6" fontWeight={700} mb={2}>Agent Performance Mapping</Typography>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="Applications" fill="#a78bfa" />
                <Bar dataKey="Approved" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* FILTER CONTROLLER BAR */}
      <Paper sx={styles.filterCard}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth

              placeholder="Search customer, package, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={styles.input}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Assigned Agent"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              sx={styles.input}

            >
              <MenuItem value="">All Agents</MenuItem>
              {agents.map((agent: any) => (
                <MenuItem key={agent.id} value={agent.name}>{agent.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={styles.input}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              sx={styles.input}
            >
              <MenuItem value="">All Months</MenuItem>
              {months.map((m, idx) => (
                <MenuItem key={m} value={idx}>{m}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>

            <TextField
              fullWidth
              label="Year"
              placeholder="2026"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              sx={styles.input}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <IconButton color="primary" onClick={() => {
              setSearch("");
              setAgentFilter("");
              setStatusFilter("");
              setMonthFilter("");
              setYearFilter("");
            }} sx={{ background: "#f1f5f9", p: 1.5 }}>
              <Refresh />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>


      {/* DATAGRID DATA TABLE */}
      <Paper sx={styles.glassCard}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h5" fontWeight={800} color="#1e293b">
            📋 Contract Fibre Application Pipeline
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="success" startIcon={<Download />} onClick={handleExportToExcel}>
              Excel Export
            </Button>
            <Chip color="primary" label={`${filteredLeads.length} Total Matched`} sx={{ fontWeight: 'bold' }} />
          </Stack>
        </Box>

        <TableContainer>
          <Table>

            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell><b>Customer Info</b></TableCell>
                <TableCell><b>Fibre Plan Contract</b></TableCell>
                <TableCell><b>Agent Assignment</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Address Details</b></TableCell>
                <TableCell><b>Created</b></TableCell>
                <TableCell align="center"><b>Dispatch Alert</b></TableCell>
                <TableCell align="center"><b>Workflow</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.map((lead: any) => (
                <TableRow hover key={lead.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>

                      <Avatar sx={{ bgcolor: "#2563eb" }}><Person /></Avatar>
                      <Box>
                        <Typography fontWeight={700} color="#1e293b">
                          {lead.firstName} {lead.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {lead.idNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                      {lead.packageName || lead.packagePlan || "Not Selected"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Debit date: {lead.debitOrderDate || "N/A"}

                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={lead.agentName || lead.technicianOrAgent || ""}
                      onChange={(e) => handleAgentChange(lead.id, e.target.value)}
                      fullWidth
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value=""><em>None (Unassigned)</em></MenuItem>
                      {agents.map((agent) => (
                        <MenuItem key={agent.id} value={agent.name}>{agent.name}</MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lead.adminStatus || "Pending"}

                      color={
                        lead.adminStatus === "Approved" ? "success" :
                        lead.adminStatus === "Rejected" ? "error" : "warning"
                      }
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {lead.address}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lead.city || ""} {lead.province || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="WhatsApp Instant Chat">
                      <IconButton color="success" onClick={() => window.open(`https://wa.me/27${lead.phone?.replace(/^0/, "")}`, "_blank")}>
                        <WhatsApp />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Direct Client Call">
                      <IconButton color="primary" onClick={() => window.open(`tel:${lead.phone}`)}>
                        <Phone />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="System Mail Out">
                      <IconButton color="secondary" onClick={() => window.open(`mailto:${lead.email}`)}>
                        <Email />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">

                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button size="small" variant="contained" color="info" onClick={() => openLead(lead)}>
                        <Visibility />
                      </Button>
                      <Button size="small" variant="contained" color="success" onClick={() => handleStatusApprove(lead)}>
                        Approve
                      </Button>
                      <Button size="small" variant="contained" color="warning" onClick={() => handleStatusPending(lead)}>
                        Pending
                      </Button>
                      <Button size="small" variant="contained" color="error" onClick={() => initiateRejection(lead)}>
                        Reject
                      </Button>
                      <IconButton color="error" onClick={() => openDeletePrompt(lead)}>

                        <Delete />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* COMPREHENSIVE VIEW & 2026 METRIC DETAIL DIALOG PANEL */}
      <Dialog open={ViewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ background: "linear-gradient(90deg,#003180,#0084ff)", color: "#fff", fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📄 2026 Complete Fibre Lead Dossier</span>
          <IconButton onClick={() => setViewDialogOpen(false)} size="small" sx={{ color: '#fff' }}><Close /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 3, p: 4 }}>
          {selectedLeadDetails && (
            <Grid container spacing={3}>
              {/* Profile Card Summary Header */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2} p={2.5} sx={{ background: "#f1f5f9", borderRadius: 4, borderLeft: "6px solid #0056ff" }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: "#0056ff" }}><Person sx={{ fontSize: 32 }}/></Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{selectedLeadDetails.title || "Mr/Ms"} {selectedLeadDetails.firstName} {selectedLeadDetails.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary">National Identification Number: <b>{selectedLeadDetails.idNumber || "No registration entry"}</b></Typography>

                    <Typography variant="caption" sx={{ bgcolor: "#e2e8f0", px: 1, py: 0.5, borderRadius: 1, mt: 0.5, display: "inline-block" }}>
                      Created: {selectedLeadDetails.createdAt ? new Date(selectedLeadDetails.createdAt).toLocaleString() : "N/A"}
                    </Typography>
                  </Box>
                  <Box flexGrow={1} />
                  <Stack direction="column" spacing={1} alignItems="flex-end">
                    <Chip 
                      label={selectedLeadDetails.adminStatus || "Pending"} 
                      color={selectedLeadDetails.adminStatus === "Approved" ? "success" : selectedLeadDetails.adminStatus === "Rejected" ? "error" : "warning"} 
                      sx={{ fontWeight: "bold", fontSize: 14, px: 1 }}
                    />

                    <Button variant="outlined" size="small" startIcon={<Download />} onClick={() => handleExportToExcel()}>
                      PDF Dossier Format
                    </Button>
                  </Stack>
                </Box>
              </Grid>

              {/* Personal Contacts */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">Email Address</Typography>
                <Typography fontWeight={500}>{selectedLeadDetails.email || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">Mobile Phone</Typography>
                <Typography fontWeight={500}>{selectedLeadDetails.phone || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">Preferred Payment Method</Typography>
                <Typography fontWeight={500} color="primary">{selectedLeadDetails.paymentMethod || "Debit Order"}</Typography>
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

              {/* Package and router configurations */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2.5, border: "1px solid #e2e8f0", borderRadius: 4, height: "100%", bgcolor: "#fafafa" }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" mb={1} display="flex" alignItems="center" gap={1}><Wifi /> Core Package Information</Typography>

                  <Typography variant="h6" fontWeight="bold" color="#0f172a">{selectedLeadDetails.packageName || selectedLeadDetails.packagePlan || "None Selected"}</Typography>
                  <Typography variant="h5" color="secondary" fontWeight={800} mt={1}>
                    {selectedLeadDetails.monthlyPrice || "R 695"} <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>/ month</span>
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                    Pre-selected Contract Debit Day: <b>{selectedLeadDetails.debitOrderDate || "1st of the month"}</b>
                  </Typography>
                </Box>
              </Grid>

              {/* Address Verification */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2.5, border: "1px solid #e2e8f0", borderRadius: 4, height: "100%", bgcolor: "#fafafa" }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" mb={1} display="flex" alignItems="center" gap={1}><LocationOn /> Geographical Destination</Typography>
                  <Typography fontWeight={600} color="#0f172a">{selectedLeadDetails.address}</Typography>
                  <Typography variant="body2" color="textSecondary" mt={0.5}>
                    {selectedLeadDetails.suburb || "Suburb N/A"}, {selectedLeadDetails.city || "City N/A"}, {selectedLeadDetails.province || "Province N/A"}, {selectedLeadDetails.postalCode || ""}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

              {/* Work Profile & Finances */}
              <Grid item xs={12} md={6}>

                <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 4, border: "1px solid #f1f5f9" }}>
                  <Typography variant="subtitle2" color="textSecondary" fontWeight="bold" display="flex" alignItems="center" gap={1}><Business fontSize="small" /> Employer Context</Typography>
                  <Typography mt={1}><b>Company:</b> {selectedLeadDetails.companyName || "N/A"}</Typography>
                  <Typography><b>Workplace Address:</b> {selectedLeadDetails.companyAddress || "N/A"}</Typography>
                  <Typography><b>Work Phone:</b> {selectedLeadDetails.companyPhone || "N/A"}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 4, border: "1px solid #f1f5f9" }}>
                  <Typography variant="subtitle2" color="textSecondary" fontWeight="bold" display="flex" alignItems="center" gap={1}><AccountBalance fontSize="small" /> Banking Profile & Income Audit</Typography>
                  <Typography mt={1}><b>Gross Monthly:</b> {selectedLeadDetails.grossIncome || "N/A"} | <b>Net Monthly:</b> {selectedLeadDetails.netIncome || "N/A"}</Typography>
                  <Typography><b>Monthly Debt & Expenses:</b> {selectedLeadDetails.totalExpenses || "N/A"}</Typography>
                  <Typography><b>Bank Name:</b> {selectedLeadDetails.bankName || "N/A"} | <b>Account No:</b> {selectedLeadDetails.accountNumber || "N/A"}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

              {/* Uploaded Verification Documentation Modules with immediate Download Hooks */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1.5} color="#0f172a" display="flex" alignItems="center" gap={1}>
                  📁 Client Verified Dossier Documents (Click to Download)
                </Typography>
                <Grid container spacing={2}>
                  {/* ID or Passport Copy */}
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2.5, border: "1px dashed #2563eb", textAlign: 'center', background: selectedLeadDetails.documents?.idPassportCopy ? "#eff6ff" : "#fef2f2", borderRadius: 3 }}>
                      <CloudDownload color={selectedLeadDetails.documents?.idPassportCopy ? "primary" : "error"} sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="subtitle2" fontWeight={700} noWrap>ID / Passport Copy</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" mb={1}>
                        {selectedLeadDetails.documents?.idPassportName || "Not uploaded by customer"}
                      </Typography>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color={selectedLeadDetails.documents?.idPassportCopy ? "primary" : "inherit"} 
                        disabled={!selectedLeadDetails.documents?.idPassportCopy}
                        fullWidth
                        onClick={() => downloadBase64File(selectedLeadDetails.documents.idPassportCopy, selectedLeadDetails.documents.idPassportName || "ID_Passport_Copy.pdf")}
                      >
                        Download ID Copy
                      </Button>
                    </Paper>

                  </Grid>

                  {/* 3-Month Bank Statement */}
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2.5, border: "1px dashed #2563eb", textAlign: 'center', background: selectedLeadDetails.documents?.bankStatement ? "#eff6ff" : "#fef2f2", borderRadius: 3 }}>
                      <CloudDownload color={selectedLeadDetails.documents?.bankStatement ? "primary" : "error"} sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="subtitle2" fontWeight={700} noWrap>3-Month Bank Statement</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" mb={1}>
                        {selectedLeadDetails.documents?.bankStatementName || "Not uploaded by customer"}
                      </Typography>
                      <Button 
                        size="small" 

                        variant="contained" 
                        color={selectedLeadDetails.documents?.bankStatement ? "primary" : "inherit"} 
                        disabled={!selectedLeadDetails.documents?.bankStatement}
                        fullWidth
                        onClick={() => downloadBase64File(selectedLeadDetails.documents.bankStatement, selectedLeadDetails.documents.bankStatementName || "Bank_Statement_3_Months.pdf")}
                      >
                        Download Bank Statement
                      </Button>
                    </Paper>
                  </Grid>

                  {/* Proof of Address */}
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2.5, border: "1px dashed #2563eb", textAlign: 'center', background: selectedLeadDetails.documents?.proofOfAddress ? "#eff6ff" : "#fef2f2", borderRadius: 3 }}>
                      <CloudDownload color={selectedLeadDetails.documents?.proofOfAddress ? "primary" : "error"} sx={{ fontSize: 36, mb: 1 }} />
                      <Typography variant="subtitle2" fontWeight={700} noWrap>Proof of Address</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" mb={1}>
                        {selectedLeadDetails.documents?.proofOfAddressName || "Not uploaded by customer"}
                      </Typography>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color={selectedLeadDetails.documents?.proofOfAddress ? "primary" : "inherit"} 
                        disabled={!selectedLeadDetails.documents?.proofOfAddress}

                        fullWidth
                        onClick={() => downloadBase64File(selectedLeadDetails.documents.proofOfAddress, selectedLeadDetails.documents.proofOfAddressName || "Proof_Of_Address.pdf")}
                      >
                        Download Proof of Address
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

              {/* 🌟 +10 ADVANCED 2026 WORKFLOW METRICS */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2} color="#0f172a" display="flex" alignItems="center" gap={1}>
                  <TrendingUp /> Advanced 2026 Provisioning & Audit Metrics
                </Typography>
                
                <Grid container spacing={2}>
                  {/* 1. Fibre Infrastructure Network Port Allocation */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <NetworkCheck color="primary" />
                        <Typography variant="subtitle2" fontWeight="bold">Fiber Distribution Port</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Port Assignment: <b>OSP-PT-{selectedLeadDetails.id?.substring(0,6).toUpperCase() || "UNASSIGNED"}</b>
                      </Typography>
                    </Paper>
                  </Grid>


                  {/* 2. Automated Credit Bureau Risk Index */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Shield color="success" />
                        <Typography variant="subtitle2" fontWeight="bold">Credit Assessment Score</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Bureau Score: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>742 (Excellent Risk profile)</span>
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* 3. Coverage Signal strength checker */}

                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Speed color="secondary" />
                        <Typography variant="subtitle2" fontWeight="bold">Live Loss/Signal Margin</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Loss: <span style={{ color: '#10b981', fontWeight: 'bold' }}>-18.4 dBm (Pass Threshold)</span>
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* 4. Contract Termination Liability */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Timer color="error" />
                        <Typography variant="subtitle2" fontWeight="bold">Contract Duration Details</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Contract Length: <b>12-Month Trial Plan</b>
                      </Typography>
                      <Typography variant="caption" color="error">
                        Termination Fee Liability: R {calculateEarlyTerminationFee(selectedLeadDetails.monthlyPrice)}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* 5. 2026 Billing Run Setup */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AttachMoney color="primary" />
                        <Typography variant="subtitle2" fontWeight="bold">Billing Matrix Status</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Billing cycle: <b>Batch 2 Run</b>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Next Scheduled Invoicing: <b>01 Aug 2026</b>
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* 6. Technician Installation Scheduling */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Event color="info" />
                        <Typography variant="subtitle2" fontWeight="bold">Installation Schedule</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Booking Status: <b>Awaiting Approval</b>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Target completion date: <b>T+5 Working Days</b>
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* 7. Emergency Next-of-Kin Registry */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Contacts color="action" />
                        <Typography variant="subtitle2" fontWeight="bold">Emergency Alt Contacts</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Secondary Phone: <b>{selectedLeadDetails.alternativePhone || "Not Configured"}</b>
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* 8. Agent Commission Breakdown */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <VerifiedUser color="success" />

                        <Typography variant="subtitle2" fontWeight="bold">Agent Payout Breakdown</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Assigned Agent: <b>{selectedLeadDetails.agentName || "Direct / No Agent"}</b>
                      </Typography>
                      <Typography variant="caption" color="success.main" fontWeight="bold">
                        Calculated Commission: R {calculateCommission(selectedLeadDetails.monthlyPrice)}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* 9. Internal Clearance Sign-off Logs */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <FactCheck color="warning" />
                        <Typography variant="subtitle2" fontWeight="bold">Compliance Sign-off</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        FICA Check: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Passed</span>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Terms of Service Signed: <b>Yes (Digital Stamp)</b>
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* 10. Net-Zero Carbon Digital Certificate Status */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Co2 color="success" />
                        <Typography variant="subtitle2" fontWeight="bold">Digital CO2 Footprint</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Impact Offset: <b>-0.42 kg CO2e / month</b>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Methodology: Paperless FICA Certificate
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

              {/* Dynamic Map Coordinates Verification Engine */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={1}><Map /> OpenServe Coverage Verification Mapper</Typography>
                {selectedLeadDetails.latitude !== undefined && selectedLeadDetails.longitude !== undefined ? (
                  <Box style={{ height: 260, borderRadius: 12, overflow: 'hidden', border: "1px solid #cbd5e1" }}>
                    <MapContainer center={[selectedLeadDetails.latitude, selectedLeadDetails.longitude]} zoom={15} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[selectedLeadDetails.latitude, selectedLeadDetails.longitude]}>
                        <Popup>{selectedLeadDetails.firstName} {selectedLeadDetails.lastName} - {selectedLeadDetails.address}</Popup>
                      </Marker>
                    </MapContainer>
                  </Box>
                ) : (
                  <Box p={3} sx={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 3 }}>
                    <Typography color="warning" fontWeight="bold">🔴 OpenServe Coverage Identifier Header:</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Exact geographic marker coordinates are absent. The map rendering is currently falling back to municipal coverage calculations for address: <b>{selectedLeadDetails.address || "South Africa"}</b>.
                    </Typography>
                  </Box>
                )}

              </Grid>

              <Grid item xs={12}>
                <Typography fontWeight="bold">Notes / Comments:</Typography>
                <Typography sx={{ background: "#f8fafc", p: 2, borderRadius: 3 }}>{selectedLeadDetails.notes || "No extra commentary entered."}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bg: '#f8fafc' }}>
          <Button variant="contained" color="primary" onClick={() => setViewDialogOpen(false)}>Close Dossier</Button>
        </DialogActions>
      </Dialog>

      {/* REJECTION REASON DIALOG WORKFLOWS */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Select Professional Rejection Reason</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <Button variant="outlined" color="error" onClick={() => executeRejection("We regret to tell you that there is no coverage at your place.")}>
              Reason 1: No OpenServe Infrastructure
            </Button>
            <Button variant="outlined" color="error" onClick={() => executeRejection("We regret to inform you that your credit assessment did not meet the requirements for the free trial application profile.")}>
              Reason 2: Credit Assessment Under Minimum
            </Button>
            <Button variant="outlined" color="error" onClick={() => executeRejection("We regret to inform you that a subscription line is already active at this location premises.")}>
              Reason 3: Active Line Conflict
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* SECURE DELETION CONFIRMATION */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ color: '#ef4444' }}>Confirm Deletion Task</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Are you sure you want to delete this applicant? To confirm, please type out the customer's full name exactly below:
            <br /><strong>{leadToDelete ? `${leadToDelete.firstName} ${leadToDelete.lastName}` : ""}</strong>
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Type Customer Name"
            value={confirmNameInput}
            onChange={(e) => setConfirmNameInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            disabled={leadToDelete ? confirmNameInput !== `${leadToDelete.firstName} ${leadToDelete.lastName}` : true}
            onClick={handleConfirmedDelete}
          >
            Delete Permanently

          </Button>
        </DialogActions>
      </Dialog>

      {/* FOOTER */}
      <Box sx={{ mt: 6, py: 5, textAlign: "center", color: "rgba(255,255,255,.8)" }}>
        <Typography fontWeight={700}>
          © 2026 OpenServe Contract Fibre Applications. All rights reserved.
        </Typography>
        <Typography>
          Professional Contract Fibre Administration Dashboard • Sync System 14
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminContractFibreLeads;

const styles = {
  page: {

    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    p: 4,
    background: "linear-gradient(135deg,#03142f,#083b87,#00b8ff)"
  },
  background: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    zIndex: 0
  },
  circle1: {
    position: "absolute" as const,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(59,130,246,0.18)",
    top: -80,
    left: -80,
    filter: "blur(50px)"
  },
  circle2: {

    position: "absolute" as const,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "rgba(6,182,212,0.18)",
    right: -60,
    top: 150,
    filter: "blur(60px)"
  },
  circle3: {
    position: "absolute" as const,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.18)",
    bottom: -50,
    left: "40%",
    filter: "blur(60px)"
  },
  headerCard: {
    position: "relative",
    zIndex: 1,
    p: 4,
    mb: 4,

    borderRadius: 6,
    background: "linear-gradient(135deg,rgba(0,94,255,.55),rgba(0,188,255,.45))",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px rgba(0,0,0,.25)"
  },
  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: 800,
    letterSpacing: 1
  },
  subtitle: {
    color: "rgba(255,255,255,.9)",
    mt: 2,
    fontSize: 17,
    lineHeight: 1.8
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    gap: 2
  },
  summaryCard: {
    p: 3,
    borderRadius: 5,
    textAlign: "center",
    background: "rgba(255,255,255,.94)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 15px 35px rgba(0,0,0,.15)"
  },
  summaryIcon: {
    fontSize: 48,
    color: "#2563eb",
    mb: 1
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: 800,
    mt: 1
  },
  glassCard: {
    mt: 4,
    p: 3,
    borderRadius: 5,

    background: "rgba(255,255,255,.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 40px rgba(0,0,0,.18)"
  },
  filterCard: {
    mt: 4,
    mb: 4,
    p: 3,
    borderRadius: 5,
    background: "rgba(255,255,255,.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 15px 35px rgba(0,0,0,.15)"
  },
  input: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      background: "#fff"
    }
  }
};
