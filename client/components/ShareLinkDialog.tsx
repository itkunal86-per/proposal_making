import React, { useEffect, useState, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { enableProposalSharing } from "@/services/proposalsService";

interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string;
  proposalTitle: string;
}

export const ShareLinkDialog: React.FC<ShareLinkDialogProps> = ({
  open,
  onOpenChange,
  proposalId,
  proposalTitle,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && !shareToken) {
      generateShareLink();
    }
  }, [open]);

  const generateShareLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await enableProposalSharing(proposalId);
      console.log("Share result:", result);
      console.log("Token received:", result.token);

      if (result.success && result.token) {
        setShareToken(result.token);
        const link = `${window.location.origin}/proposal/${result.token}`;
        console.log("Link being set:", link);
        setShareLink(link);
        console.log("Generated share link:", link);
      } else {
        const errorMsg = result.error || "Failed to generate share link";
        setError(errorMsg);
        console.error("Share error:", errorMsg);
        toast({ title: "Error", description: errorMsg, variant: "destructive" });
      }
    } catch (error) {
      console.error("Share link error:", error);
      const errorMsg = "Failed to generate share link";
      setError(errorMsg);
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLink) return;

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        toast({ title: "Success", description: "Link copied to clipboard" });
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        // If Clipboard API fails, fall through to fallback
      }
    }

    // Fallback: select the text in the input field and use execCommand
    if (inputRef.current) {
      try {
        inputRef.current.select();
        inputRef.current.setSelectionRange(0, 99999); // For mobile devices

        if (document.execCommand("copy")) {
          setCopied(true);
          toast({ title: "Success", description: "Link copied to clipboard" });
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      } catch (fallbackErr) {
        // Continue to final fallback
      }
    }

    // Final fallback: show toast with manual copy instruction
    toast({
      title: "Copy Link",
      description: "Please select and copy the link manually (Ctrl+C or Cmd+C)",
      variant: "default",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Proposal</DialogTitle>
          <DialogDescription>
            Share "{proposalTitle}" with a public link
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
              <Button onClick={generateShareLink} variant="ghost" size="sm" className="mt-2">
                Try Again
              </Button>
            </div>
          ) : shareLink ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Share Link</label>
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="min-w-fit"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the proposal without signing in.
              </p>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
