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
}

interface SignatureDetailsModalProps {
  open: boolean;
  signatureDetails: SignatureDetails;
  onClose: () => void;
  onSave: (details: SignatureDetails) => void;
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
}) => {
  const [fullName, setFullName] = useState(signatureDetails.fullName || "");
  const [email, setEmail] = useState(signatureDetails.email || "");
  const [position, setPosition] = useState(signatureDetails.position || "");
  const [signature, setSignature] = useState(signatureDetails.signature || "");

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
    onSave({
      fullName,
      email,
      position,
      signature,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Signature Details</DialogTitle>
          <DialogDescription>
            Enter the signer's information. The signature will be auto-generated.
          </DialogDescription>
        </DialogHeader>

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
            <div className="border border-slate-200 rounded-md p-4 bg-slate-50 flex items-center justify-center min-h-16">
              <div
                className="text-3xl font-script text-slate-700 select-none"
                style={{
                  fontFamily: "cursive",
                  fontStyle: "italic",
                  fontWeight: "bold",
                  letterSpacing: "0.1em",
                }}
              >
                {signature || "Your Signature"}
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
