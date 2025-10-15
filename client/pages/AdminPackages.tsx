import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Sparkles } from "lucide-react";
import {
  type PackagePlan,
  type BillingCycle,
  type CreatePackageInput,
  PACKAGE_QUERY_KEY,
  createPackage,
  listPackages,
} from "@/services/packageService";

interface FormState {
  name: string;
  code: string;
  price: string;
  currency: string;
  billingCycle: BillingCycle;
  description: string;
  features: string;
  isPopular: boolean;
  status: "active" | "inactive";
}

const INITIAL_FORM: FormState = {
  name: "",
  code: "",
  price: "",
  currency: "USD",
  billingCycle: "monthly",
  description: "",
  features: "",
  isPopular: false,
  status: "active",
};

const currencyOptions = ["USD", "EUR", "GBP", "INR"];

export default function AdminPackages() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: PACKAGE_QUERY_KEY,
    queryFn: listPackages,
  });
  const packages = data ?? [];

  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const createMutation = useMutation({
    mutationFn: (payload: CreatePackageInput) => createPackage(payload),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: PACKAGE_QUERY_KEY });
      setForm(INITIAL_FORM);
      toast({
        title: "Package created",
        description: `${plan.name} is now available to your teams`,
      });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Unable to create package";
      toast({
        title: "Could not create package",
        description: message,
        variant: "destructive",
      });
    },
  });

  const stats = useMemo(() => {
    const total = packages.length;
    const active = packages.filter((plan) => plan.status === "active").length;
    const popular = packages.filter((plan) => plan.isPopular).length;
    return { total, active, popular };
  }, [packages]);

  const isSubmitting = createMutation.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      toast({
        title: "Invalid price",
        description: "Price must be a positive number",
        variant: "destructive",
      });
      return;
    }

    const features = form.features
      .split(/\r?\n/)
      .map((feature) => feature.trim())
      .filter(Boolean);

    if (features.length === 0) {
      toast({
        title: "Add at least one feature",
        description: "List the benefits included in this package",
        variant: "destructive",
      });
      return;
    }

    const payload: CreatePackageInput = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim(),
      price,
      currency: form.currency.trim() || "USD",
      billingCycle: form.billingCycle,
      features,
      isPopular: form.isPopular,
      status: form.status,
    };

    if (!payload.name || !payload.description) {
      toast({
        title: "Missing required fields",
        description: "Name and description are required",
        variant: "destructive",
      });
      return;
    }

    await createMutation.mutateAsync(payload);
  }

  function formatCurrency(plan: PackagePlan) {
    if (plan.price <= 0) {
      return "Free";
    }
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: plan.currency,
        maximumFractionDigits: 0,
      }).format(plan.price);
    } catch {
      return `${plan.price} ${plan.currency}`;
    }
  }

  function formatDate(value: string) {
    if (!value) return "—";
    try {
      const date = new Date(value);
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return value;
    }
  }

  const showTableSkeleton = isLoading && packages.length === 0;

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Admin tools
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Package catalog</h1>
            <p className="text-muted-foreground">
              Configure customer-facing packages and prepare for the Laravel API hand-off.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total packages</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Unique packages available for customers.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active plans</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.active}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Plans currently visible in onboarding and billing.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Featured</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.popular}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Highlighted plans promoted in marketing flows.
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Configured packages</CardTitle>
              <CardDescription>
                Review the packages that will be served by the Laravel API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isError ? (
                <div className="space-y-4 rounded-md border border-destructive/20 bg-destructive/5 p-6 text-destructive">
                  <p className="font-medium">Could not load packages.</p>
                  <p className="text-sm text-destructive/80">
                    {(error instanceof Error && error.message) || "Please try again"}
                  </p>
                  <Button variant="outline" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              ) : showTableSkeleton ? (
                <div className="flex items-center gap-3 rounded-md border p-6 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading packages
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[220px]">Plan</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="min-w-[260px]">Key features</TableHead>
                      <TableHead className="w-[140px]">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-foreground">{plan.name}</span>
                              <Badge variant="outline" className="lowercase">
                                {plan.code}
                              </Badge>
                              {plan.isPopular ? (
                                <Badge className="bg-primary/10 text-primary" variant="secondary">
                                  Popular
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground">{plan.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{formatCurrency(plan)}</div>
                          <div className="text-xs capitalize text-muted-foreground">
                            {plan.billingCycle}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={plan.status === "active" ? "secondary" : "outline"}>
                            {plan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 text-primary" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(plan.createdAt)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create package</CardTitle>
              <CardDescription>
                Store the configuration locally. The same payload will be returned by the Laravel API later on.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter plan name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    placeholder="Slug (optional)"
                    value={form.code}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, code: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Short summary shown on pricing"
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      value={form.price}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, price: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={form.currency}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, currency: value }))
                      }
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Billing cycle</Label>
                  <Select
                    value={form.billingCycle}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        billingCycle: value as BillingCycle,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="features">Key features</Label>
                  <Textarea
                    id="features"
                    placeholder="One feature per line"
                    value={form.features}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, features: event.target.value }))
                    }
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="space-y-1">
                    <Label className="text-sm">Mark as featured</Label>
                    <p className="text-xs text-muted-foreground">
                      Featured plans appear first in marketing pages.
                    </p>
                  </div>
                  <Switch
                    checked={form.isPopular}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, isPopular: checked }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        status: value as "active" | "inactive",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Save package"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(INITIAL_FORM)}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
