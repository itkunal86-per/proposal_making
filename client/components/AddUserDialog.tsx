import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { fetchRoles, createSubscriberUser, type RoleOption } from "@/services/subscriberUsersService";
import { toast } from "@/hooks/use-toast";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

export default function AddUserDialog({
  open,
  onOpenChange,
  onUserCreated,
}: AddUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState("Active");
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

  async function loadRoles() {
    try {
      setLoadingRoles(true);
      const data = await fetchRoles();
      setRoles(data);
      if (data.length > 0) {
        setRoleId(String(data[0].id));
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load roles",
      });
    } finally {
      setLoadingRoles(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !roleId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setSubmitting(true);
    const result = await createSubscriberUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role_id: parseInt(roleId),
      status: status as "Active" | "Inactive",
    });
    setSubmitting(false);

    if (result.success) {
      toast({
        title: "Success",
        description: `User ${name} added successfully`,
      });
      setName("");
      setEmail("");
      setStatus("Active");
      if (roles.length > 0) {
        setRoleId(String(roles[0].id));
      }
      onOpenChange(false);
      onUserCreated();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add user",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new team member to your workspace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={submitting || loadingRoles}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={submitting}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loadingRoles}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
