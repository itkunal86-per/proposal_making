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
import { fetchSettings, updateIntegrationSettings } from "@/services/settingsService";

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

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [openGoHighLevel, setOpenGoHighLevel] = useState(false);
  const [openHubSpot, setOpenHubSpot] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    setLoading(true);
    const response = await fetchSettings();
    if (response.success && response.data) {
      const hasGhlKey = !!response.data.ghl_api_key?.trim();
      const hasHubSpotKey = !!response.data.hubspot_api_key?.trim();

      const updated = integrations.map((i) => {
        if (i.id === "gohighlevel") {
          return { ...i, status: hasGhlKey ? "connected" as const : "disconnected" as const };
        } else if (i.id === "hubspot") {
          return { ...i, status: hasHubSpotKey ? "connected" as const : "disconnected" as const };
        }
        return i;
      });
      setIntegrations(updated);
    }
    setLoading(false);
  }

  const handleGoHighLevelConnect = async (credentials: GoHighLevelCredentials) => {
    const response = await updateIntegrationSettings({
      ghl_api_key: credentials.apiKey,
      location_id: credentials.locationId,
      hubspot_api_key: "",
    });

    if (response.success) {
      const updated = integrations.map((i) =>
        i.id === "gohighlevel"
          ? { ...i, status: "connected" as const }
          : i
      );
      setIntegrations(updated);
      setOpenGoHighLevel(false);
      toast({ title: "GoHighLevel connected successfully" });
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to connect GoHighLevel",
        variant: "destructive",
      });
    }
  };

  const handleHubSpotConnect = async (credentials: HubSpotCredentials) => {
    const response = await updateIntegrationSettings({
      hubspot_api_key: credentials.accessToken,
      ghl_api_key: "",
      location_id: "",
    });

    if (response.success) {
      const updated = integrations.map((i) =>
        i.id === "hubspot"
          ? { ...i, status: "connected" as const }
          : i
      );
      setIntegrations(updated);
      setOpenHubSpot(false);
      toast({ title: "HubSpot connected successfully" });
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to connect HubSpot",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    const params = {
      ghl_api_key: integrationId === "gohighlevel" ? "" : "",
      location_id: integrationId === "gohighlevel" ? "" : "",
      hubspot_api_key: integrationId === "hubspot" ? "" : "",
    };

    const response = await updateIntegrationSettings(params);

    if (response.success) {
      const updated = integrations.map((i) =>
        i.id === integrationId
          ? { ...i, status: "disconnected" as const }
          : i
      );
      setIntegrations(updated);
      toast({ title: `${integrationId === "gohighlevel" ? "GoHighLevel" : "HubSpot"} disconnected` });
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to disconnect",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppShell>
        <section className="container py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Integrations</h1>
              <p className="text-muted-foreground">
                Connect your favorite tools to streamline your workflow
              </p>
            </div>
          </div>
          <div className="mt-6">Loading integrations...</div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
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
    </AppShell>
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setApiKey("");
      setLocationId("");
      setErrors({});
    }
  }, [open]);

  async function submit() {
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

    setSubmitting(true);
    await onConnect({ apiKey: apiKey.trim(), locationId: locationId.trim() });
    setSubmitting(false);
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
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Connecting..." : "Connect"}
            </Button>
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setAccessToken("");
      setErrors({});
    }
  }, [open]);

  async function submit() {
    const newErrors: Record<string, string> = {};

    if (!accessToken.trim()) {
      newErrors.accessToken = "Access Token is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    await onConnect({ accessToken: accessToken.trim() });
    setSubmitting(false);
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
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
