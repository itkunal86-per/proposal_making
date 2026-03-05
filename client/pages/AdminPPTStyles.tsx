import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { listPPTStyles, type PPTStyle } from "@/services/pptStylesService";

export default function AdminPPTStyles() {
  const [styles, setStyles] = useState<PPTStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStyles();
  }, []);

  async function fetchStyles() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listPPTStyles();
      setStyles(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch PPT styles";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">PPT Styles</h1>
            <p className="text-muted-foreground">Manage PowerPoint presentation styles and templates.</p>
          </div>
          <Button>Add Style</Button>
        </div>

        {error && (
          <Card className="mt-4 p-4 bg-red-50 border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="mt-4 p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading PPT styles...</p>
            </div>
          </Card>
        ) : styles.length === 0 ? (
          <Card className="mt-4 p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No PPT styles found.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {styles.map((style) => (
              <Card key={style.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Preview Section */}
                <div
                  className="h-40 bg-gradient-to-br flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${style.primary_color} 0%, ${style.secondary_color} 100%)`
                  }}
                >
                  {style.preview_image ? (
                    <img
                      src={style.preview_image}
                      alt={style.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute top-3 right-3">
                    {style.is_active && (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{style.name}</h3>

                  {/* Layout Type */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Layout Type</p>
                    <p className="text-sm capitalize">{style.layout_type}</p>
                  </div>

                  {/* Colors */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Colors</p>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: style.primary_color }}
                          title="Primary"
                        />
                        <span className="text-xs text-muted-foreground">Primary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: style.secondary_color }}
                          title="Secondary"
                        />
                        <span className="text-xs text-muted-foreground">Secondary</span>
                      </div>
                    </div>
                  </div>

                  {/* Fonts */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Fonts</p>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium">Title:</span> {style.title_font} ({style.title_font_size}px)</p>
                      <p><span className="font-medium">Body:</span> {style.body_font} ({style.body_font_size}px)</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
