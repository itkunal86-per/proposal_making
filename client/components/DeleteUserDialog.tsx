import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteSubscriberUser } from "@/services/subscriberUsersService";
import { toast } from "@/hooks/use-toast";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
  userName: string;
  onUserDeleted: () => void;
}

export default function DeleteUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onUserDeleted,
}: DeleteUserDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!userId) return;

    setDeleting(true);
    const result = await deleteSubscriberUser(userId);
    setDeleting(false);

    if (result.success) {
      toast({
        title: "Success",
        description: `User ${userName} has been deleted`,
      });
      onOpenChange(false);
      onUserDeleted();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete user",
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
