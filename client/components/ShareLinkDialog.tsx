import React, { useEffect, useState } from "react";
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
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && !shareToken) {
      generateShareLink();
    }
  }, [open, shareToken]);

  const generateShareLink = async () => {
    setIsLoading(true);
    try {
      const result = await enableProposalSharing(proposalId);
      if (result.success && result.token) {
        setShareToken(result.token);
        const link = `${window.location.origin}/proposal/${result.token}`;
        setShareLink(link);
      } else {
        toast({ title: "Error", description: result.error || "Failed to generate share link", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate share link", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({ title: "Success", description: "Link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
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
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Share Link</label>
                <div className="flex gap-2">
                  <Input
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
