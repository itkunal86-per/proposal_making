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
import {
  fetchUserDetails,
  updateSubscriberUser,
  fetchRoles,
  type RoleOption,
  type SubscriberUserRecord,
} from "@/services/subscriberUsersService";
import { toast } from "@/hooks/use-toast";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
  onUserUpdated: () => void;
}

export default function EditUserDialog({
  open,
  onOpenChange,
  userId,
  onUserUpdated,
}: EditUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState("Active");
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUserAndRoles();
    }
  }, [open, userId]);

  async function loadUserAndRoles() {
    try {
      setLoading(true);
      const [userRes, rolesRes] = await Promise.all([
        fetchUserDetails(userId!),
        fetchRoles(),
      ]);

      if (userRes.success && userRes.data) {
        setName(userRes.data.user.name);
        setEmail(userRes.data.user.email);
        setRoleId(String(userRes.data.role.id));
        setStatus(userRes.data.status);
      } else {
        toast({
          title: "Error",
          description: userRes.error || "Failed to load user details",
        });
      }

      if (rolesRes.data) {
        setRoles(rolesRes.data);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load user information",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !roleId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setSubmitting(true);
    const result = await updateSubscriberUser(userId!, {
      name: name.trim(),
      role_id: parseInt(roleId),
      status: status as "Active" | "Inactive",
    });
    setSubmitting(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      onOpenChange(false);
      onUserUpdated();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update user",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details and role assignment
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Email address"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={roleId} onValueChange={setRoleId} disabled={submitting}>
                <SelectTrigger id="edit-role">
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
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={submitting}>
                <SelectTrigger id="edit-status">
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
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
