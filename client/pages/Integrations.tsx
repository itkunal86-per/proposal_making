import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: "connected" | "disconnected";
  features: string[];
}

interface GoHighLevelCredentials {
  apiKey: string;
  locationId: string;
}

interface HubSpotCredentials {
  accessToken: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    description: "Connect to GoHighLevel to sync leads, manage campaigns, and automate workflows",
    logo: "🚀",
    status: "disconnected",
    features: [
      "Lead sync",
      "Campaign management",
      "Workflow automation",
      "Contact management",
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Integrate with HubSpot to manage contacts, deals, and automate marketing workflows",
    logo: "🎯",
    status: "disconnected",
    features: [
      "Contact management",
      "Deal tracking",
      "Email integration",
      "Marketing automation",
    ],
  },
];

interface NavItem {
  href: string;
  label: string;
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/packages", label: "Packages" },
    { href: "/admin/templates", label: "Templates" },
    { href: "/admin/settings", label: "Settings" },
  ],
  subscriber: [
    { href: "/my/proposals", label: "My Proposals" },
    { href: "/my/clients", label: "My Clients" },
    { href: "/integrations", label: "Integrations" },
    { href: "/my/settings", label: "Settings" },
  ],
};

export default function Integrations() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [openGoHighLevel, setOpenGoHighLevel] = useState(false);
  const [openHubSpot, setOpenHubSpot] = useState(false);

  const navItems = useMemo(() => {
    return user ? navByRole[user.role] : [];
  }, [user]);

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const stored = localStorage.getItem("integrations");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIntegrations(parsed);
      } catch (error) {
        console.error("Failed to parse stored integrations:", error);
      }
    }
  }, []);

  const handleGoHighLevelConnect = (credentials: GoHighLevelCredentials) => {
    const updated = integrations.map((i) =>
      i.id === "gohighlevel"
        ? { ...i, status: "connected" as const }
        : i
    );
    setIntegrations(updated);
    localStorage.setItem("integrations", JSON.stringify(updated));
    localStorage.setItem(
      "gohighlevel_credentials",
      JSON.stringify(credentials)
    );
    setOpenGoHighLevel(false);
    toast({ title: "GoHighLevel connected successfully" });
  };

  const handleHubSpotConnect = (credentials: HubSpotCredentials) => {
    const updated = integrations.map((i) =>
      i.id === "hubspot"
        ? { ...i, status: "connected" as const }
        : i
    );
    setIntegrations(updated);
    localStorage.setItem("integrations", JSON.stringify(updated));
    localStorage.setItem("hubspot_credentials", JSON.stringify(credentials));
    setOpenHubSpot(false);
    toast({ title: "HubSpot connected successfully" });
  };

  const handleDisconnect = (integrationId: string) => {
    const updated = integrations.map((i) =>
      i.id === integrationId
        ? { ...i, status: "disconnected" as const }
        : i
    );
    setIntegrations(updated);
    localStorage.setItem("integrations", JSON.stringify(updated));
    localStorage.removeItem(`${integrationId}_credentials`);
    toast({ title: `${integrationId === "gohighlevel" ? "GoHighLevel" : "HubSpot"} disconnected` });
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <Sidebar collapsible="offcanvas" className="border-r">
          <SidebarHeader>
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-cyan-500" />
                <span className="text-sm font-semibold">Proposal AI</span>
              </div>
              {user && (
                <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-xs font-medium text-sidebar-accent-foreground">
                  {user.role === "admin" ? "Admin" : "Subscriber"}
                </span>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => {
                  const active =
                    location.pathname === item.href ||
                    location.pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-2",
                            active && "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          {user && (
            <SidebarFooter>
              <div className="rounded-lg border bg-background p-3 text-xs">
                <div className="font-medium text-foreground">{user.name}</div>
                {user.company && (
                  <div className="text-muted-foreground">{user.company}</div>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          )}
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="flex min-h-screen w-full flex-col">
          <main className="flex-1">
            <section className="container py-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">Integrations</h1>
                  <p className="text-muted-foreground">
                    Connect your favorite tools to streamline your workflow
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{integration.logo}</div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold">{integration.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {integration.status === "connected" ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Connected
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Not connected
                      </span>
                    </>
                  )}
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                    Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t">
                  {integration.status === "connected" ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (integration.id === "gohighlevel") {
                          setOpenGoHighLevel(true);
                        } else {
                          setOpenHubSpot(true);
                        }
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
              </div>
            </section>
          </main>
        </SidebarInset>
      </div>

      <GoHighLevelDialog
        open={openGoHighLevel}
        onOpenChange={setOpenGoHighLevel}
        onConnect={handleGoHighLevelConnect}
      />
      <HubSpotDialog
        open={openHubSpot}
        onOpenChange={setOpenHubSpot}
        onConnect={handleHubSpotConnect}
      />
    </SidebarProvider>
  );
}

function GoHighLevelDialog({
  open,
  onOpenChange,
  onConnect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConnect: (credentials: GoHighLevelCredentials) => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [locationId, setLocationId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setApiKey("");
      setLocationId("");
      setErrors({});
    }
  }, [open]);

  function submit() {
    const newErrors: Record<string, string> = {};

    if (!apiKey.trim()) {
      newErrors.apiKey = "API Key is required";
    }
    if (!locationId.trim()) {
      newErrors.locationId = "Location ID is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConnect({ apiKey: apiKey.trim(), locationId: locationId.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect GoHighLevel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="ghl-api-key">API Key</Label>
            <Input
              id="ghl-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setErrors({ ...errors, apiKey: "" });
              }}
              placeholder="Enter your GoHighLevel API Key"
              aria-invalid={!!errors.apiKey}
            />
            {errors.apiKey && (
              <p className="text-xs text-destructive">{errors.apiKey}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ghl-location-id">Location ID</Label>
            <Input
              id="ghl-location-id"
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                setErrors({ ...errors, locationId: "" });
              }}
              placeholder="Enter your GoHighLevel Location ID"
              aria-invalid={!!errors.locationId}
            />
            {errors.locationId && (
              <p className="text-xs text-destructive">{errors.locationId}</p>
            )}
          </div>

          <Separator />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={submit}>Connect</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HubSpotDialog({
  open,
  onOpenChange,
  onConnect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConnect: (credentials: HubSpotCredentials) => void;
}) {
  const [accessToken, setAccessToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setAccessToken("");
      setErrors({});
    }
  }, [open]);

  function submit() {
    const newErrors: Record<string, string> = {};

    if (!accessToken.trim()) {
      newErrors.accessToken = "Access Token is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConnect({ accessToken: accessToken.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect HubSpot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="hubspot-token">Access Token</Label>
            <Input
              id="hubspot-token"
              type="password"
              value={accessToken}
              onChange={(e) => {
                setAccessToken(e.target.value);
                setErrors({ ...errors, accessToken: "" });
              }}
              placeholder="Enter your HubSpot Access Token"
              aria-invalid={!!errors.accessToken}
            />
            {errors.accessToken && (
              <p className="text-xs text-destructive">{errors.accessToken}</p>
            )}
          </div>

          <Separator />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={submit}>Connect</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
