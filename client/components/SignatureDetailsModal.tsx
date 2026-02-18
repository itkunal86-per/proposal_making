import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignatureDetails {
  fullName?: string;
  email?: string;
  position?: string;
  signature?: string;
  signedAt?: number;
  signatureDisplayText?: string;
  status?: "pending" | "signed" | "declined";
}

interface SignatureDetailsModalProps {
  open: boolean;
  signatureDetails: SignatureDetails;
  onClose: () => void;
  onSave: (details: SignatureDetails) => void;
  isAlreadySigned?: boolean;
}

// Generate signature from full name
const generateSignature = (fullName: string): string => {
  if (!fullName || fullName.trim().length === 0) {
    return "";
  }

  // Return the full name as signature
  return fullName.trim();
};

export const SignatureDetailsModal: React.FC<SignatureDetailsModalProps> = ({
  open,
  signatureDetails,
  onClose,
  onSave,
  isAlreadySigned = false,
}) => {
  const [fullName, setFullName] = useState(signatureDetails.fullName || "");
  const [email, setEmail] = useState(signatureDetails.email || "");
  const [position, setPosition] = useState(signatureDetails.position || "");
  const [signature, setSignature] = useState(signatureDetails.signature || "");
  const isSignedAlready = signatureDetails.status === "signed" || isAlreadySigned;

  // Auto-generate signature when fullName changes
  useEffect(() => {
    const generatedSignature = generateSignature(fullName);
    setSignature(generatedSignature);
  }, [fullName]);

  // Update internal state when modal opens with new details
  useEffect(() => {
    if (open) {
      setFullName(signatureDetails.fullName || "");
      setEmail(signatureDetails.email || "");
      setPosition(signatureDetails.position || "");
      setSignature(signatureDetails.signature || generateSignature(signatureDetails.fullName || ""));
    }
  }, [open, signatureDetails]);

  const handleSave = () => {
    // If already signed, preserve the original timestamp and display text
    if (isSignedAlready && signatureDetails.signedAt && signatureDetails.signatureDisplayText) {
      onSave({
        fullName,
        email,
        position,
        signature,
        signedAt: signatureDetails.signedAt,
        signatureDisplayText: signatureDetails.signatureDisplayText,
        status: "signed" as const,
      });
      return;
    }

    // Generate new timestamp and display text for first-time signatures
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const timezoneOffset = -now.getTimezoneOffset();
    const tzHours = Math.floor(Math.abs(timezoneOffset) / 60);
    const tzMinutes = Math.abs(timezoneOffset) % 60;
    const tzSign = timezoneOffset >= 0 ? "+" : "-";
    const tzStr = `GMT${tzSign}${String(tzHours).padStart(2, "0")}${String(tzMinutes).padStart(2, "0")}`;

    const signedAt = now.getTime();
    const signatureDisplayText = `Signed by: ${fullName}\n${dateStr}, ${timeStr} ${tzStr}`;

    onSave({
      fullName,
      email,
      position,
      signature,
      signedAt,
      signatureDisplayText,
      status: "signed" as const,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Signature Details</DialogTitle>
          <DialogDescription>
            {isSignedAlready
              ? "This signature has been signed. You can update the details, and the original signature time will be preserved."
              : "Enter the signer's information. The signature will be auto-generated."}
          </DialogDescription>
        </DialogHeader>

        {isSignedAlready && signatureDetails.signatureDisplayText && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
            <div className="font-semibold mb-1">Original Signature:</div>
            <div className="whitespace-pre-wrap font-mono text-xs">
              {signatureDetails.signatureDisplayText.replace(/\\n/g, '\n')}
            </div>
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full-name" className="text-sm font-semibold">
              Full Name
            </Label>
            <Input
              id="full-name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-semibold">
              Position
            </Label>
            <Input
              id="position"
              placeholder="e.g., Manager, Director, CEO"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Signature Preview */}
          <div className="space-y-2">
            <Label htmlFor="signature" className="text-sm font-semibold">
              Signature (Auto-generated)
            </Label>
            <div className="border border-slate-200 rounded-md p-6 bg-slate-50">
              <div className="text-center">
                <div
                  className="text-4xl text-slate-700 select-none mb-2"
                  style={{
                    fontFamily: "cursive",
                    fontStyle: "italic",
                    fontWeight: "bold",
                  }}
                >
                  {signature || "Your Signature"}
                </div>
                {isSignedAlready && signatureDetails.signedAt && (
                  <div className="text-xs text-slate-600 whitespace-pre-wrap leading-tight">
                    {signatureDetails.signatureDisplayText?.replace(/\\n/g, '\n')}
                  </div>
                )}
              </div>
            </div>
            <input
              id="signature"
              type="hidden"
              value={signature}
            />
          </div>

          {/* Info text */}
          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-100">
            <p>
              • Signature is automatically generated from the full name
              <br />
              • You can manually edit the signature field if needed
              <br />
              • Email and position are optional
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-base"
          >
            Save Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
