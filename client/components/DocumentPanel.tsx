import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentSettings {
  company?: string;
  contact?: string;
  sender?: string;
  currency?: string;
}

interface DocumentPanelProps {
  documentSettings?: DocumentSettings;
  onUpdateSettings: (settings: DocumentSettings) => void;
}

export const DocumentPanel: React.FC<DocumentPanelProps> = ({
  documentSettings = {},
  onUpdateSettings,
}) => {
  const handleChange = (field: keyof DocumentSettings, value: string) => {
    onUpdateSettings({ ...documentSettings, [field]: value });
  };

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Document Settings</h2>

      <div>
        <Label className="text-xs font-semibold">Company</Label>
        <Select
          value={documentSettings.company || ""}
          onValueChange={(value) => handleChange("company", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company1">Company 1</SelectItem>
            <SelectItem value="company2">Company 2</SelectItem>
            <SelectItem value="company3">Company 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold">Contact</Label>
        <Select
          value={documentSettings.contact || ""}
          onValueChange={(value) => handleChange("contact", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select a contact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contact1">Contact 1</SelectItem>
            <SelectItem value="contact2">Contact 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold">Sender</Label>
        <Select
          value={documentSettings.sender || ""}
          onValueChange={(value) => handleChange("sender", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select sender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sams-roy">Sams Roy</SelectItem>
            <SelectItem value="john-doe">John Doe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full justify-between">
        Document Style
        <ChevronRight className="w-4 h-4" />
      </Button>

      <Separator />

      <div>
        <Label className="text-xs font-semibold mb-2 block">
          Currency Options
        </Label>
        <Label className="text-xs text-muted-foreground">Document Currency</Label>
        <Select
          value={documentSettings.currency || "USD"}
          onValueChange={(value) => handleChange("currency", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">US Dollar (USD)</SelectItem>
            <SelectItem value="EUR">Euro (EUR)</SelectItem>
            <SelectItem value="GBP">British Pound (GBP)</SelectItem>
            <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
            <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};
