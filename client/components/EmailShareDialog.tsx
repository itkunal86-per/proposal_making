import React, { useState } from "react";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { getStoredToken } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalTitle: string;
  shareLink: string;
}

export const EmailShareDialog: React.FC<EmailShareDialogProps> = ({
  open,
  onOpenChange,
  proposalTitle,
  shareLink,
}) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [userEmail, setUserEmail] = useState("user@example.com");

  const addRecipient = () => {
    if (currentEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) {
      setRecipients([...recipients, currentEmail]);
      setCurrentEmail("");
    } else {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRecipient();
    }
  };

  const handleSendEmail = async () => {
    if (recipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please add at least one recipient",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const subject = `${proposalTitle} - Proposal`;
      const body = message
        ? `${message}\n\nView proposal: ${shareLink}`
        : `Check out this proposal: ${shareLink}`;

      const emailData = {
        to: recipients,
        from: userEmail,
        subject,
        body,
        shareLink,
      };

      const response = await fetch("https://propai-api.hirenq.com/api/send-proposal-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast({
        title: "Success",
        description: `Email sent to ${recipients.length} recipient(s)`,
      });

      // Reset and close
      setRecipients([]);
      setCurrentEmail("");
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Send email error:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Share "{proposalTitle}" via email
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="space-y-4">
          {/* To Field */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              To
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={addRecipient}
                variant="outline"
                size="sm"
                className="px-4"
              >
                Add
              </Button>
            </div>
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipients.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-full text-sm"
                  >
                    <span className="text-blue-900">{email}</span>
                    <button
                      onClick={() => removeRecipient(email)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* From Field */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              From
            </label>
            <Input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="bg-slate-50"
            />
          </div>

          {/* Subject Field */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Subject
            </label>
            <Input
              type="text"
              value={`${proposalTitle} - Proposal`}
              readOnly
              className="bg-slate-50"
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add your message (optional)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={8}
            />
            <p className="text-xs text-slate-500 mt-2">
              The proposal link will be automatically added to the email.
            </p>
          </div>

          {/* Send Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSending || recipients.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? "Sending..." : "Send email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
