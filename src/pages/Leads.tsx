
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  //Badge as MuiBadge
} from "@mui/material";
import {

  WhatsApp,
  Email,
  Delete,
  Search,
  Map,
  Download,
  Person,
  Home as HomeIcon,
  Phone,
  Badge,
  AssignmentInd,
  Notes,
  CancelPresentation,
  CheckCircle,
  HourglassEmpty
} from "@mui/icons-material";

import { ref, onValue, remove, update } from "firebase/database";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

const MotionCard = motion(Card);

const Leads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]); // Dynamically loaded agents
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Delete Guard State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  // Rejection/Decline Reason Dialog State
  const [declineDialogOpen, 

setDeclineDialogOpen] = useState(false);
  const [leadToDecline, setLeadToDecline] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Detail View Dialog State
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<any | null>(null);

  useEffect(() => {
    // Corresponds with Home.tsx database node[cite: 8]
    const leadRef = ref(db, "prepaidFibreLeads");

    const unsubscribe = onValue(leadRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({

          id: key,
          ...data[key],
        }));
        setLeads(formatted.reverse());
      } else {
        setLeads([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Dynamically fetch agents from database
  useEffect(() => {
    const agentsRef = ref(db, "agents");

    const unsubscribe = onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          ...(typeof data[key] === 'object' ? data[key] : 

{ name: data[key] })
        }));
        setAgents(formatted);
      } else {
        setAgents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateStatusInDB = (id: string, status: string, reason = "") => {
    const updatePayload: any = { status };
    if (reason) {
      updatePayload.rejectionReason = reason;
    }
    update(ref(db, `prepaidFibreLeads/${id}`), updatePayload);
  };

  const handleDeclineSubmission = () => {
    if (leadToDecline && rejectionReason.trim()) {
      updateStatusInDB(leadToDecline.id, "Declined", rejectionReason.trim());
      sendNotification(leadToDecline, "Declined", rejectionReason.trim());
      setDeclineDialogOpen(false);
      setLeadToDecline(null);
      setRejectionReason("");
    }
  };

  const executeDeleteLead = () => {
    if (leadToDelete && deleteConfirmName.trim() === `${leadToDelete.firstNamesOrContactName} ${leadToDelete.surnameOrBusinessName}`) {
      remove(ref(db, `prepaidFibreLeads/${leadToDelete.id}`));
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      setDeleteConfirmName("");
    }
  };

  const handleAssignAgent = (id: string, agentName: string) => {
    update(ref(db, `prepaidFibreLeads/${id}`), { technicianOrAgent: agentName });
  };

  const searchCoverageMap = (address: string, suburb: string, city: string) => {
    const query = encodeURIComponent(`${address}, ${suburb}, ${city}`);
    window.open(`https://www.openserve.co.za/open/fibre?searchQuery=${query}`, "_blank");
  };

  const downloadDocument = (base64Data: string, filename: string) => {
    if (!base64Data) return alert("No document available for download.");
    
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = filename || "ID_Verification_Document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const sendNotification = (lead: any, status: string, customReason = "") => {
    const fullName = `${lead.firstNamesOrContactName} ${lead.surnameOrBusinessName}`;
    const formattedDate = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "recent date";
    
    let statusMessage = "";
    
    if (status === "Approved") {
      statusMessage = `Good day ${fullName},\n\nWe are thrilled to inform you that your Prepaid OpenServe Fibre application submitted on ${formattedDate} has been officially APPROVED! 🎉\n\nOur deployment dispatchers are prepping your complementary 14-day promotional window.\n\n🛒 Package Details:\n- Connection: ${lead.packageName || "Prepaid Fibre Bundle"}\n- Voucher Value: ${lead.voucherPrice || "TBD"}\n- Installation Cost: FREE Promo (Until End of Sept 2026)\n\nAn agent will contact you shortly to finalize configuration. Thank you for choosing us!`;
    } else if (status === "Declined") {
      statusMessage = `Good day ${fullName},\n\nThank you for your interest in our Prepaid OpenServe Fibre. After reviewing your submission from ${formattedDate}, we regret to inform you that we are currently unable to approve your application.\n\nReason for decline: ${customReason || "Area infrastructure capacity limitations."}\n\nIf you have any questions or would like to submit alternative physical address paths, please feel free to reach out to us directly.`;
    } else {
      statusMessage = `Good day ${fullName},\n\nWe have updated the status of your Prepaid OpenServe Fibre application.\n\nCurrent Status: [${status.toUpperCase()}]\nPackage: ${lead.packageName}\n\nOur agents are diligently working on your provisioning profile. We will keep you updated on any progression.`;
    }

    return statusMessage;
  };

  const triggerWhatsApp = (lead: any, status: string, reason = "") => {
    const cleanPhone = lead.phone?.replace(/\D/g, "");
    const formattedPhone = cleanPhone?.startsWith("0") ? `27${cleanPhone.substring(1)}` : cleanPhone;
    const message = sendNotification(lead, status, reason);
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const triggerEmail = (lead: any, status: string, reason = "") => {
    const subject = encodeURIComponent(`OpenServe Prepaid Fibre - Application Status Update (${status})`);
    const body = encodeURIComponent(sendNotification(lead, status, reason));
    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, "_blank");
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Filter Functions
  const monthlyLeads = leads.filter((lead) => {
    if (!lead.createdAt) return false;
    const date = new Date(lead.createdAt);
    return date.getMonth() === selectedMonth;
  });

  const filteredMonthlyLeads = monthlyLeads.filter((lead) => {
    const textMatch = `${lead.firstNamesOrContactName} ${lead.surnameOrBusinessName} ${lead.email} ${lead.address} ${lead.phone} ${lead.idOrRegistrationNumber}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const statusMatch = statusFilter === "All" || lead.status === statusFilter;
    return textMatch && statusMatch;
  });

  // Export Selected Month's Leads to Excel
  const handleExportExcel = () => {
    if (monthlyLeads.length === 0) {
      alert(`No lead records found for ${months[selectedMonth]}.`);
      return;
    }

    const worksheetData = monthlyLeads.map((l) => ({
      "Lead ID": l.id || "",
      "Name": `${l.firstNamesOrContactName || ""} ${l.surnameOrBusinessName || ""}`,
      "ID / Reg Number": l.idOrRegistrationNumber || "",

      "Phone": l.phone || "",
      "Email": l.email || "",
      "Address": `${l.address || ""}, ${l.suburb || ""}, ${l.city || ""}`,
      "Package": l.packageName || "",
      "Voucher Value": l.voucherPrice || "",
      "Agent Assigned": l.technicianOrAgent || "Unassigned",
      "Status": l.status || "Pending",
      "Created At": l.createdAt ? new Date(l.createdAt).toLocaleString() : ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Leads ${months[selectedMonth]}`);
    
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Prepaid_Fibre_Leads_${months[selectedMonth]}_2026.xlsx`);
  };

  // Stats Counters (Filtered by Selected Month)
  const totalCount = monthlyLeads.length;
  const approvedCount = monthlyLeads.filter(l => l.status === "Approved").length;
  const pendingCount = monthlyLeads.filter(l => l.status === "Pending" || !l.status).length;
  const declinedCount = monthlyLeads.filter(l => l.status === "Declined").length;

  const styles = {
    dashboard: {
      background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #ffffff 100%)", // Gentle light blue/white gradient[cite: 8]
      minHeight: "100vh",
      py: 6,
      color: "#0f172a" // Slate-900 typography
    },
    card: {
      background: "#ffffff", // Pure white card surfaces[cite: 8]

      borderRadius: "24px",
      border: "1px solid #e2e8f0",
      color: "#0f172a",
      boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-5px)",
        borderColor: "#38bdf8", // Sky blue border highlights
        boxShadow: "0 15px 30px rgba(56, 189, 248, 0.15)"
      }
    },
    searchBar: {
      background: "#ffffff",
      borderRadius: "16px",
      "& .MuiOutlinedInput-root": {
        color: "#0f172a",
        "& fieldset": { borderColor: "#cbd5e1" },
        "&:hover fieldset": { borderColor: "#0284c7" },
        "&.Mui-focused fieldset": { borderColor: "#0284c7" }
      },

      "& .MuiInputLabel-root": { color: "#64748b" }
    }
  };

  return (
    <Box sx={styles.dashboard}>
      <Container maxWidth="xl">
        
        {/* HEADER SECTION */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={3}>
          <Box>
            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: "-1px", color: "#0369a1" }}>
              <span style={{ color: "#0284c7" }}>Prepaid</span> Leads Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: "#475569" }}>
              Manage, activate, and route OpenServe fiber submissions for {months[selectedMonth]} 2026 promotions.

            </Typography>
          </Box>
          
          {/* Month, Status & Excel controls */}
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <Button
              variant="contained"
              onClick={handleExportExcel}
              sx={{
                bgcolor: "#0284c7",
                color: "#ffffff",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: "bold",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#0369a1" }
              }}
              startIcon={<Download />}
            >
              Export {months[selectedMonth]} to Excel
            </Button>

            <TextField
              select
              label="Selected Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={styles.searchBar}
              size="small"
              style={{ minWidth: 150 }}
            >
              {months.map((month, idx) => (
                <MenuItem key={idx} value={idx}>{month}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={styles.searchBar}
              size="small"

              style={{ minWidth: 150 }}
            >
              {["All", "Pending", "Received", "In Process", "Approved", "Declined"].map((st) => (
                <MenuItem key={st} value={st}>{st}</MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {/* 📈 ANALYTICS WIDGETS */}
        <Grid container spacing={3} mb={4}>
          {[
            { title: "Total Submissions", count: totalCount, icon: <AssignmentInd />, color: "#3290ff" },
            { title: "Active Pending", count: pendingCount, icon: <HourglassEmpty />, color: "#f59e0b" },
            { title: "Approved Fiber", count: approvedCount, icon: <CheckCircle />, color: "#10b981" },
            { title: "Declined Submissions", count: declinedCount, icon: <CancelPresentation />, color: "#ef4444" }
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 3, borderRadius: "20px", background: "#ffffff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                <Box>
                  <Typography variant="body2" color="#64748b" fontWeight="bold">{stat.title}</Typography>
                  <Typography variant="h4" fontWeight={900} mt={1} color="#0f172a">{stat.count}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>{stat.icon}</Avatar>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* SEARCH & CONTROLS CONTAINER */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: "20px", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                label="Search lead profiles by Name, Suburb, Email, ID or Contact details..."
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={styles.searchBar}
                InputProps={{
                  startAdornment: <Search style={{ color: "#94a3b8", marginRight: 8 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
              <Typography variant="body2" color="#64748b">
                Showing <strong>{filteredMonthlyLeads.length}</strong> matching entries
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* 📋 LEADS GRID CARD VIEW */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredMonthlyLeads.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ py: 10, textAlign: "center" }}>
                  <Typography variant="h5" color="#94a3b8" fontWeight="bold">
                    No prepaid fibre leads found matching this criteria.
                  </Typography>
                </Box>
              </Grid>

            ) : (
              filteredMonthlyLeads.map((lead) => (
                <Grid item xs={12} md={6} lg={4} key={lead.id}>
                  <MotionCard
                    sx={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      
                      {/* Name & ID Verification State */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h5" fontWeight={800} color="#0284c7">
                            {lead.title} {lead.firstNamesOrContactName} {lead.surnameOrBusinessName}
                          </Typography>

                          <Typography variant="body2" color="#64748b" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Badge fontSize="inherit" sx={{ mr: 0.5 }} /> ID: {lead.idOrRegistrationNumber}
                          </Typography>
                        </Box>
                        
                        {/* Status Chip */}
                        <Chip
                          label={lead.status || "Pending"}
                          color={
                            lead.status === "Approved" ? "success" :
                            lead.status === "Declined" ? "error" : "warning"
                          }
                          sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                        />
                      </Box>

                      <Divider sx={{ borderColor: "#f1f5f9", my: 1.5 }} />


                      {/* Package Block */}
                      <Box sx={{ mb: 2, p: 2, borderRadius: "12px", background: "#f0f9ff", border: "1px solid #e0f2fe" }}>
                        <Typography variant="body2" color="#0369a1" fontWeight="bold">Package Selection</Typography>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5, color: "#0f172a" }}>
                          {lead.packageName || "Not Provided"}
                        </Typography>
                        {lead.voucherPrice && (
                          <Typography variant="body2" color="#475569" fontWeight="bold" sx={{ mt: 0.5 }}>
                            Voucher Value: {lead.voucherPrice}
                          </Typography>
                        )}
                      </Box>

                      {/* Contact & Address Details */}

                      <Box display="flex" flexDirection="column" gap={1} mb={2}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#475569' }}>
                          <Phone sx={{ fontSize: "1.1rem", mr: 1, color: "#94a3b8" }} /> {lead.phone}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#475569' }}>
                          <Email sx={{ fontSize: "1.1rem", mr: 1, color: "#94a3b8" }} /> {lead.email}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', color: '#475569' }}>
                          <HomeIcon sx={{ fontSize: "1.1rem", mr: 1, mt: 0.3, color: "#94a3b8" }} />
                          <span>{lead.address}, {lead.suburb}, {lead.city}, {lead.province}, {lead.postalCode}</span>
                        </Typography>
                      </Box>


                      {/* Dynamic Declined / Rejected Notification Context */}
                      {lead.status === "Declined" && lead.rejectionReason && (
                        <Box sx={{ p: 1.5, mb: 2, borderRadius: "8px", background: "#fef2f2", border: "1px solid #fee2e2" }}>
                          <Typography variant="caption" color="#b91c1c" fontWeight="bold" sx={{ display: "block" }}>Decline Reason:</Typography>
                          <Typography variant="body2" color="#991b1b">{lead.rejectionReason}</Typography>
                        </Box>
                      )}

                      {/* Agent Assignment (Pulled Live from Database) */}
                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="caption" color="#64748b" display="block" mb={0.5}>Assigned Agent / Field Technician</Typography>
                        <TextField

                          select
                          fullWidth
                          size="small"
                          value={lead.technicianOrAgent || ""}
                          onChange={(e) => handleAssignAgent(lead.id, e.target.value)}
                          sx={{
                            background: "#f8fafc",
                            borderRadius: "10px",
                            "& .MuiOutlinedInput-root": {
                              color: "#0f172a",
                              "& fieldset": { borderColor: "#cbd5e1" }
                            }
                          }}
                        >
                          <MenuItem value="">Unassigned</MenuItem>
                          {agents.map((agent) => (
                            <MenuItem key={agent.id} value={agent.name || agent.id}>
                              {agent.name || agent.id}
                            </MenuItem>
                          ))}

                        </TextField>
                      </Box>

                      {/* ACTION CONTROLS BAR */}
                      <Grid container spacing={1} mb={2}>
                        {["Received", "In Process", "Approved"].map((status) => (
                          <Grid item xs={4} key={status}>
                            <Button
                              fullWidth
                              size="small"
                              variant={lead.status === status ? "contained" : "outlined"}
                              color={status === "Approved" ? "success" : "info"}
                              onClick={() => {
                                updateStatusInDB(lead.id, status);
                                sendNotification(lead, status);
                              }}
                              sx={{ fontSize: "0.7rem", fontWeight: "bold", textTransform: "none", borderRadius: "8px" }}
                            >

                              {status}
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            fullWidth
                            size="small"
                            variant={lead.status === "Declined" ? "contained" : "outlined"}
                            color="error"
                            onClick={() => {
                              setLeadToDecline(lead);
                              setDeclineDialogOpen(true);
                            }}
                            sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "none", borderRadius: "8px" }}
                          >
                            Mark Declined / Rejected
                          </Button>
                        </Grid>
                      </Grid>

                      <Divider sx={{ borderColor: "#f1f5f9", mb: 2 }} />

                      {/* UTILITY CAPABILITIES FOOTER */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" gap={1}>
                          <Tooltip title="Verify OpenServe Coverage Area">
                            <IconButton
                              onClick={() => searchCoverageMap(lead.address, lead.suburb, lead.city)}
                              sx={{ color: "#0284c7", background: "#e0f2fe", "&:hover": { background: "#bae6fd" } }}
                            >
                              <Map />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="View Detailed Profile">

                            <IconButton
                              onClick={() => {
                                setSelectedLeadDetails(lead);
                                setViewDialogOpen(true);
                              }}
                              sx={{ color: "#475569", background: "#f1f5f9", "&:hover": { background: "#cbd5e1" } }}
                            >
                              <Notes />
                            </IconButton>
                          </Tooltip>

                          {lead.idPhotoBase64 && (
                            <Tooltip title="Download Verification ID Paperwork">
                              <IconButton
                                onClick={() => downloadDocument(lead.idPhotoBase64, lead.idPhotoFileName)}
                                sx={{ color: "#a855f7", background: "#f3e8ff", "&:hover": { background: "#e9d5ff" } }}
                              >

                                <Download />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>

                        <Box display="flex" gap={1}>
                          <Tooltip title="Send Professional Status via WhatsApp">
                            <IconButton
                              onClick={() => triggerWhatsApp(lead, lead.status || "Pending", lead.rejectionReason)}
                              sx={{ color: "#25D366", background: "rgba(37,211,102,0.1)", "&:hover": { background: "rgba(37,211,102,0.2)" } }}
                            >
                              <WhatsApp />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Send Status Update via Email">
                            <IconButton

                              onClick={() => triggerEmail(lead, lead.status || "Pending", lead.rejectionReason)}
                              sx={{ color: "#3b82f6", background: "rgba(59,130,246,0.1)", "&:hover": { background: "rgba(59,130,246,0.2)" } }}
                            >
                              <Email />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Securely">
                            <IconButton
                              onClick={() => {
                                setLeadToDelete(lead);
                                setDeleteDialogOpen(true);
                              }}
                              sx={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", "&:hover": { background: "rgba(239,68,68,0.2)" } }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>

                      </Box>

                    </CardContent>
                  </MotionCard>
                </Grid>
              ))
            )}
          </AnimatePresence>
        </Grid>

        {/* 🛑 SECURE SYSTEM DELETE CONFIRM DIALOG */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{ sx: { bgcolor: "#ffffff", color: "#0f172a", borderRadius: "18px", p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: "bold", color: "#ef4444" }}>⚠️ Delete Lead Safely</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 3, color: "#475569" }}>
              To confirm deletion of this fiber lead, please type the client's full name: <br />
              <strong style={{ color: "#f97316" }}>
                {leadToDelete ? `${leadToDelete.firstNamesOrContactName} ${leadToDelete.surnameOrBusinessName}` : ""}
              </strong>
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              label="Type client full name to authorize"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              sx={styles.searchBar}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: "#64748b" }}>
              Cancel
            </Button>
            <Button

              variant="contained"
              color="error"
              disabled={!leadToDelete || deleteConfirmName !== `${leadToDelete.firstNamesOrContactName} ${leadToDelete.surnameOrBusinessName}`}
              onClick={executeDeleteLead}
              sx={{ fontWeight: "bold", borderRadius: "8px", textTransform: "none" }}
            >
              Authorize Permanent Deletion
            </Button>
          </DialogActions>
        </Dialog>

        {/* ❌ DECLINE REJECTED STATUS LOGIC DIALOG */}
        <Dialog
          open={declineDialogOpen}
          onClose={() => setDeclineDialogOpen(false)}
          PaperProps={{ sx: { bgcolor: "#ffffff", color: "#0f172a", borderRadius: "18px", p: 1, width: "100%", maxWidth: 500 } }}
        >

          <DialogTitle sx={{ fontWeight: "bold", color: "#ef4444" }}>Decline Application Reason</DialogTitle>
          <DialogContent>
            <Typography variant="body2" mb={2} color="#475569">
              Please specify the precise reason for declining {leadToDecline?.firstNamesOrContactName}'s prepaid fibre profile. This will be automatically embedded in the automated WhatsApp/Email notification.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Decline Explanation/Reason"
              placeholder="E.g., OpenServe infrastructure layout indicates no physical fiber infrastructure at terminal box."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}

              sx={styles.searchBar}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeclineDialogOpen(false)} sx={{ color: "#64748b" }}>
              Close
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeclineSubmission}
              disabled={!rejectionReason.trim()}
              sx={{ fontWeight: "bold", borderRadius: "8px", textTransform: "none" }}
            >
              Confirm Decline Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* 📝 ALL DETAILS VIEW DIALOG */}
        <Dialog

          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          PaperProps={{ sx: { bgcolor: "#ffffff", color: "#0f172a", borderRadius: "24px", p: 2, width: "100%", maxWidth: 650 } }}
        >
          <DialogTitle sx={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 1, color: "#0284c7" }}>
            <Person /> Complete Lead Overview
          </DialogTitle>
          <DialogContent>
            {selectedLeadDetails && (
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <Box>
                  <Typography variant="caption" color="#64748b">Full Name / Business Profile</Typography>
                  <Typography variant="h6" fontWeight={700} color="#0f172a">
                    {selectedLeadDetails.title} {selectedLeadDetails.firstNamesOrContactName} {selectedLeadDetails.surnameOrBusinessName}

                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="#64748b">ID / Registration Number</Typography>
                    <Typography variant="body1" fontWeight={600} color="#0f172a">{selectedLeadDetails.idOrRegistrationNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="#64748b">Created At</Typography>
                    <Typography variant="body1" fontWeight={600} color="#0f172a">
                      {selectedLeadDetails.createdAt ? new Date(selectedLeadDetails.createdAt).toLocaleString() : "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="#64748b">Phone Number</Typography>
                    <Typography variant="body1" fontWeight={600} color="#0f172a">{selectedLeadDetails.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="#64748b">Email Address</Typography>
                    <Typography variant="body1" fontWeight={600} color="#0f172a">{selectedLeadDetails.email}</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ borderColor: "#f1f5f9" }} />
                <Box>
                  <Typography variant="caption" color="#64748b">Physical Address Location</Typography>
                  <Typography variant="body1" fontWeight={600} color="#0f172a">
                    {selectedLeadDetails.address}, {selectedLeadDetails.suburb}, {selectedLeadDetails.city}, {selectedLeadDetails.province}, {selectedLeadDetails.postalCode}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "#f1f5f9" }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="#64748b">Selected Voucher Package</Typography>
                    <Typography variant="body1" fontWeight={600} color="#0284c7">{selectedLeadDetails.packageName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="#64748b">Voucher Price</Typography>
                    <Typography variant="body1" fontWeight={600} color="#10b981">{selectedLeadDetails.voucherPrice || "N/A"}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="#64748b">Submitting Agent/Technician</Typography>
                    <Typography variant="body1" fontWeight={600} color="#0f172a">{selectedLeadDetails.technicianOrAgent || "Unassigned"}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="#64748b">Verification Image File</Typography>
                    <Typography variant="body1" fontWeight={600} color="#0f172a">{selectedLeadDetails.idPhotoFileName || "No Document Found"}</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ borderColor: "#f1f5f9" }} />
                <Box>
                  <Typography variant="caption" color="#64748b">Administrative Comments & Notes</Typography>

                  <Paper sx={{ p: 2, mt: 0.5, bgcolor: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                    <Typography variant="body2">{selectedLeadDetails.notes || "No extra comments provided by submitter."}</Typography>
                  </Paper>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setViewDialogOpen(false)} variant="contained" sx={{ bgcolor: "#0284c7", color: "#ffffff", fontWeight: "bold", borderRadius: "8px", textTransform: "none", "&:hover": { bgcolor: "#0369a1" } }}>
              Close View
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
};

export default Leads;
