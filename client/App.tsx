import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "@/components/layout/Layout";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import Reset from "./pages/Reset";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProposalEditor from "./pages/ProposalEditor";
import ProposalSettings from "./pages/ProposalSettings";
import ProposalView from "./pages/ProposalView";
import AcceptInvite from "./pages/AcceptInvite";
import AdminPackages from "./pages/AdminPackages";
import AdminTemplates from "./pages/AdminTemplates";
import AdminSettings from "./pages/AdminSettings";
import AdminUsers from "./pages/AdminUsers";
import MyProposals from "./pages/MyProposals";
import MyClients from "./pages/MyClients";
import SubscriberSettings from "./pages/SubscriberSettings";
import { AuthProvider } from "@/providers/AuthProvider";
import { RequireAuth, RequireRole } from "@/components/auth/RouteGuards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset" element={<Reset />} />
              <Route path="/register" element={<Register />} />
              <Route path="/p/:token" element={<ProposalView />} />
              <Route path="/invite/:token" element={<AcceptInvite />} />

              <Route element={<RequireAuth />}>
                <Route element={<RequireRole roles={["admin"]} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/packages" element={<AdminPackages />} />
                  <Route path="/admin/templates" element={<AdminTemplates />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>

                <Route element={<RequireRole roles={["subscriber"]} />}>
                  <Route path="/my/proposals" element={<MyProposals />} />
                  <Route path="/my/clients" element={<MyClients />} />
                  <Route path="/my/settings" element={<SubscriberSettings />} />
                </Route>

                <Route path="/proposals/:id/edit" element={<ProposalEditor />} />
                <Route path="/proposals/:id/settings" element={<ProposalSettings />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
