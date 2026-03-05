import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminPPTStyles() {
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

        <Card className="mt-4 p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">PPT Styles management coming soon.</p>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
