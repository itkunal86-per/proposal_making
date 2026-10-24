import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LegacySlotPreview } from "@/services/aiGenerationService";

interface LegacySlotReviewDialogProps {
  open: boolean;
  slots: LegacySlotPreview[];
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (slotIds: string[]) => void;
}

export function LegacySlotReviewDialog({
  open,
  slots,
  isLoading = false,
  onOpenChange,
  onConfirm,
}: LegacySlotReviewDialogProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setSelected({});
    }
  }, [open, slots]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose text for AI to rewrite</DialogTitle>
          <DialogDescription>
            Checked text can be rewritten. Branding, legal lines, and placeholders such as {"{{first_name}}"} stay unchanged until you check that box. A placeholder inside a checked box still stays unchanged.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {slots.map((slot) => (
            <label key={slot.slot_id} className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={Boolean(selected[slot.slot_id])}
                disabled={isLoading}
                onChange={(event) => {
                  setSelected((current) => ({
                    ...current,
                    [slot.slot_id]: event.target.checked,
                  }));
                }}
              />
              <span>
                <span className="block text-gray-900">{slot.preview || "Empty text"}</span>
                <span className="text-xs text-gray-500">Protected until selected</span>
              </span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => {
              onConfirm(slots.filter((slot) => selected[slot.slot_id]).map((slot) => slot.slot_id));
            }}
          >
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
