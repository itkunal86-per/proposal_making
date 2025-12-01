import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: "connected" | "disconnected";
  features: string[];
}

const integrations: Integration[] = [
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
  const handleConnect = (integrationId: string) => {
    console.log(`Connecting to ${integrationId}`);
  };

  const handleDisconnect = (integrationId: string) => {
    console.log(`Disconnecting from ${integrationId}`);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your favorite tools to streamline your workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{integration.logo}</div>
                  <div>
                    <h2 className="text-xl font-semibold">{integration.name}</h2>
                    <p className="text-sm text-muted-foreground">
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
                    onClick={() => handleConnect(integration.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
