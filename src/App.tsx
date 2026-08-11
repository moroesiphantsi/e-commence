import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Agents from "./pages/Agents";
import AdminLogin from "./pages/AdminLogin";
import AdminSignUp from "./pages/AdminSignUp";
import LeadDetails from "./pages/LeadDetails";
import FieldUpdates from "./pages/FieldUpdates";
import FreeTrial from "./pages/FreeTrial";
import ContractFibreLeads from "./pages/ContractFibreLeads";
import AdminFreeTrial from "./pages/AdminFreeTrial";
import AdminContractFibreLeads from "./pages/AdminContractFibreLeads";
import AdminECommence from "./pages/AdminE-Commence";
import ECommence from "./pages/E-Commence";






function App() {
  return (
    <Routes>

      {/* 🌍 PUBLIC ROUTES */}
      <Route path="/" element={<ECommence />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/signup" element={<AdminSignUp />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/free/trial" element={<AdminFreeTrial />} />
      <Route path="/admin/contractfibreleads" element={<AdminContractFibreLeads />} />
      <Route path="/admin/e-commence" element={<AdminECommence />} />



      <Route path="/user/free-trial" element={<FreeTrial />} />
      <Route path="/user/contractfibreleads" element={<ContractFibreLeads />} />
      <Route path="/user/field-updates" element={<FieldUpdates/>}/>
      <Route path="/user/e-commence" element={<ECommence/>}/>
      


<Route
     path="/admin/leads"
        element={<Leads />}
      />
      

      {/* 👤 SINGLE LEAD DETAILS (NEW CRM FEATURE) */}
      <Route
        path="/admin/leads/:id"
        element={ <LeadDetails />
         
        }
      />

      {/* 👨‍💼 AGENTS */}
      <Route
        path="/admin/agents"
        element={
          <Agents />
        }
      />

      {/* 🔁 DEFAULT FALLBACK (OPTIONAL BUT USEFUL) */}
      <Route path="*" element={<Home />} />

    </Routes>
  );
}

export default App;