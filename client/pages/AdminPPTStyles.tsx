import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  listPPTStyles,
  createPPTStyle,
  getPPTStyleById,
  updatePPTStyle,
  type PPTStyle,
  type CreatePPTStyleInput,
  type StyleConfig,
} from "@/services/pptStylesService";

interface FormData {
  name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  title_font: string;
  body_font: string;
  title_font_size: number;
  body_font_size: number;
  title_font_color: string;
  body_font_color: string;
  layout_type: string;
  is_active: number;
}

const DEFAULT_FORM_DATA: FormData = {
  name: "",
  primary_color: "#0A2E5C",
  secondary_color: "#F7941D",
  background_color: "#0A2E5C",
  title_font: "Montserrat",
  body_font: "Calibri",
  title_font_size: 40,
  body_font_size: 22,
  title_font_color: "#FFFFFF",
  body_font_color: "#EAEAEA",
  layout_type: "standard",
  is_active: 1,
};

export default function AdminPPTStyles() {
  const [styles, setStyles] = useState<PPTStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);

  // Edit state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStyleId, setEditingStyleId] = useState<number | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editFormData, setEditFormData] = useState<FormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    fetchStyles();
  }, []);

  async function fetchStyles() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listPPTStyles();
      setStyles(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch PPT styles";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleColorChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleCreateStyle() {
    if (!formData.name.trim()) {
      setCreateError("Style name is required");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      const styleConfig: StyleConfig = {
        fonts: {
          body: {
            size: formData.body_font_size,
            family: formData.body_font,
            weight: "regular",
          },
          heading: {
            size: formData.title_font_size,
            family: formData.title_font,
            weight: "bold",
          },
        },
        colors: {
          body: formData.body_font_color,
          accent: formData.secondary_color,
          heading: formData.title_font_color,
          background: formData.background_color,
        },
      };

      const input: CreatePPTStyleInput = {
        ...formData,
        style_config: styleConfig,
      };

      await createPPTStyle(input);

      toast({
        title: "Success",
        description: "PPT style created successfully",
      });

      setFormData(DEFAULT_FORM_DATA);
      setIsCreateDialogOpen(false);
      await fetchStyles();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create PPT style";
      setCreateError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleEditClick(style: PPTStyle) {
    setEditingStyleId(style.id);
    setIsEditLoading(true);
    setEditError("");

    try {
      const fullStyle = await getPPTStyleById(style.id);
      setEditFormData({
        name: fullStyle.name,
        primary_color: fullStyle.primary_color,
        secondary_color: fullStyle.secondary_color,
        background_color: fullStyle.background_color,
        title_font: fullStyle.title_font,
        body_font: fullStyle.body_font,
        title_font_size: Number(fullStyle.title_font_size),
        body_font_size: Number(fullStyle.body_font_size),
        title_font_color: fullStyle.title_font_color,
        body_font_color: fullStyle.body_font_color,
        layout_type: fullStyle.layout_type,
        is_active: fullStyle.is_active ? 1 : 0,
      });
      setIsEditDialogOpen(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load style details";
      setEditError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsEditLoading(false);
    }
  }

  function handleEditInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleEditColorChange(field: keyof FormData, value: string) {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSaveEdit() {
    if (!editFormData.name.trim()) {
      setEditError("Style name is required");
      return;
    }

    if (!editingStyleId) {
      setEditError("No style selected");
      return;
    }

    setIsEditing(true);
    setEditError("");

    try {
      const styleConfig: StyleConfig = {
        fonts: {
          body: {
            size: editFormData.body_font_size,
            family: editFormData.body_font,
            weight: "regular",
          },
          heading: {
            size: editFormData.title_font_size,
            family: editFormData.title_font,
            weight: "bold",
          },
        },
        colors: {
          body: editFormData.body_font_color,
          accent: editFormData.secondary_color,
          heading: editFormData.title_font_color,
          background: editFormData.background_color,
        },
      };

      const input: CreatePPTStyleInput = {
        ...editFormData,
        style_config: styleConfig,
      };

      await updatePPTStyle(editingStyleId, input);

      toast({
        title: "Success",
        description: "PPT style updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingStyleId(null);
      setEditFormData(DEFAULT_FORM_DATA);
      await fetchStyles();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update PPT style";
      setEditError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  }

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">PPT Styles</h1>
            <p className="text-muted-foreground">
              Manage PowerPoint presentation styles and templates.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Add Style
          </Button>
        </div>

        {error && (
          <Card className="mt-4 p-4 bg-red-50 border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="mt-4 p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading PPT styles...</p>
            </div>
          </Card>
        ) : styles.length === 0 ? (
          <Card className="mt-4 p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No PPT styles found.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {styles.map((style) => (
              <Card
                key={style.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-40 bg-gradient-to-br flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${style.primary_color} 0%, ${style.secondary_color} 100%)`,
                  }}
                >
                  {style.preview_image ? (
                    <img
                      src={style.preview_image}
                      alt={style.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute top-3 right-3">
                    {style.is_active && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{style.name}</h3>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Layout Type
                    </p>
                    <p className="text-sm capitalize">{style.layout_type}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Colors
                    </p>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{
                            backgroundColor: style.primary_color,
                          }}
                          title="Primary"
                        />
                        <span className="text-xs text-muted-foreground">
                          Primary
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{
                            backgroundColor: style.secondary_color,
                          }}
                          title="Secondary"
                        />
                        <span className="text-xs text-muted-foreground">
                          Secondary
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Fonts
                    </p>
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="font-medium">Title:</span>{" "}
                        {style.title_font} ({style.title_font_size}px)
                      </p>
                      <p>
                        <span className="font-medium">Body:</span>{" "}
                        {style.body_font} ({style.body_font_size}px)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditClick(style)}
                      disabled={isEditLoading}
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New PPT Style</DialogTitle>
              <DialogDescription>
                Add a new PowerPoint presentation style with custom colors and
                fonts.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                  {createError}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Basic Information</h3>
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Style Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Corporate Blue"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isCreating}
                  />
                </div>
                <div>
                  <Label htmlFor="layout_type" className="text-sm font-medium">
                    Layout Type
                  </Label>
                  <select
                    id="layout_type"
                    name="layout_type"
                    value={formData.layout_type}
                    onChange={handleInputChange}
                    disabled={isCreating}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="standard">Standard</option>
                    <option value="minimal">Minimal</option>
                    <option value="creative">Creative</option>
                    <option value="premium">Premium</option>
                    <option value="modern">Modern</option>
                  </select>
                </div>
              </div>

              <Separator />

              {/* Colors */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Colors</h3>
                <div className="grid grid-cols-2 gap-3">
                  <ColorPickerField
                    label="Primary Color"
                    value={formData.primary_color}
                    onChange={(value) =>
                      handleColorChange("primary_color", value)
                    }
                    disabled={isCreating}
                  />
                  <ColorPickerField
                    label="Secondary Color"
                    value={formData.secondary_color}
                    onChange={(value) =>
                      handleColorChange("secondary_color", value)
                    }
                    disabled={isCreating}
                  />
                  <ColorPickerField
                    label="Background Color"
                    value={formData.background_color}
                    onChange={(value) =>
                      handleColorChange("background_color", value)
                    }
                    disabled={isCreating}
                  />
                  <ColorPickerField
                    label="Title Font Color"
                    value={formData.title_font_color}
                    onChange={(value) =>
                      handleColorChange("title_font_color", value)
                    }
                    disabled={isCreating}
                  />
                  <ColorPickerField
                    label="Body Font Color"
                    value={formData.body_font_color}
                    onChange={(value) =>
                      handleColorChange("body_font_color", value)
                    }
                    disabled={isCreating}
                  />
                </div>
              </div>

              <Separator />

              {/* Fonts */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Fonts</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="title_font" className="text-sm font-medium">
                      Title Font
                    </Label>
                    <Input
                      id="title_font"
                      name="title_font"
                      placeholder="e.g., Montserrat"
                      value={formData.title_font}
                      onChange={handleInputChange}
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="title_font_size"
                      className="text-sm font-medium"
                    >
                      Title Font Size (px)
                    </Label>
                    <Input
                      id="title_font_size"
                      name="title_font_size"
                      type="number"
                      value={formData.title_font_size}
                      onChange={handleInputChange}
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="body_font" className="text-sm font-medium">
                      Body Font
                    </Label>
                    <Input
                      id="body_font"
                      name="body_font"
                      placeholder="e.g., Calibri"
                      value={formData.body_font}
                      onChange={handleInputChange}
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="body_font_size"
                      className="text-sm font-medium"
                    >
                      Body Font Size (px)
                    </Label>
                    <Input
                      id="body_font_size"
                      name="body_font_size"
                      type="number"
                      value={formData.body_font_size}
                      onChange={handleInputChange}
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setCreateError("");
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateStyle}
                  disabled={isCreating || !formData.name.trim()}
                >
                  {isCreating ? "Creating..." : "Create Style"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Style Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit PPT Style</DialogTitle>
              <DialogDescription>
                Update the PowerPoint presentation style colors and fonts.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                  {editError}
                </div>
              )}

              {isEditLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Loading style details...
                  </p>
                </div>
              ) : (
                <>
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">
                      Basic Information
                    </h3>
                    <div>
                      <Label
                        htmlFor="edit-name"
                        className="text-sm font-medium"
                      >
                        Style Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        name="name"
                        placeholder="e.g., Corporate Blue"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                        disabled={isEditing}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-layout_type"
                        className="text-sm font-medium"
                      >
                        Layout Type
                      </Label>
                      <select
                        id="edit-layout_type"
                        name="layout_type"
                        value={editFormData.layout_type}
                        onChange={handleEditInputChange}
                        disabled={isEditing}
                        className="w-full border rounded px-3 py-2 text-sm"
                      >
                        <option value="standard">Standard</option>
                        <option value="minimal">Minimal</option>
                        <option value="creative">Creative</option>
                        <option value="premium">Premium</option>
                        <option value="modern">Modern</option>
                      </select>
                    </div>
                  </div>

                  <Separator />

                  {/* Colors */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Colors</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <ColorPickerField
                        label="Primary Color"
                        value={editFormData.primary_color}
                        onChange={(value) =>
                          handleEditColorChange("primary_color", value)
                        }
                        disabled={isEditing}
                      />
                      <ColorPickerField
                        label="Secondary Color"
                        value={editFormData.secondary_color}
                        onChange={(value) =>
                          handleEditColorChange("secondary_color", value)
                        }
                        disabled={isEditing}
                      />
                      <ColorPickerField
                        label="Background Color"
                        value={editFormData.background_color}
                        onChange={(value) =>
                          handleEditColorChange("background_color", value)
                        }
                        disabled={isEditing}
                      />
                      <ColorPickerField
                        label="Title Font Color"
                        value={editFormData.title_font_color}
                        onChange={(value) =>
                          handleEditColorChange("title_font_color", value)
                        }
                        disabled={isEditing}
                      />
                      <ColorPickerField
                        label="Body Font Color"
                        value={editFormData.body_font_color}
                        onChange={(value) =>
                          handleEditColorChange("body_font_color", value)
                        }
                        disabled={isEditing}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Fonts */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Fonts</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="edit-title_font"
                          className="text-sm font-medium"
                        >
                          Title Font
                        </Label>
                        <Input
                          id="edit-title_font"
                          name="title_font"
                          placeholder="e.g., Montserrat"
                          value={editFormData.title_font}
                          onChange={handleEditInputChange}
                          disabled={isEditing}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="edit-title_font_size"
                          className="text-sm font-medium"
                        >
                          Title Font Size (px)
                        </Label>
                        <Input
                          id="edit-title_font_size"
                          name="title_font_size"
                          type="number"
                          value={editFormData.title_font_size}
                          onChange={handleEditInputChange}
                          disabled={isEditing}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="edit-body_font"
                          className="text-sm font-medium"
                        >
                          Body Font
                        </Label>
                        <Input
                          id="edit-body_font"
                          name="body_font"
                          placeholder="e.g., Calibri"
                          value={editFormData.body_font}
                          onChange={handleEditInputChange}
                          disabled={isEditing}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="edit-body_font_size"
                          className="text-sm font-medium"
                        >
                          Body Font Size (px)
                        </Label>
                        <Input
                          id="edit-body_font_size"
                          name="body_font_size"
                          type="number"
                          value={editFormData.body_font_size}
                          onChange={handleEditInputChange}
                          disabled={isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setEditingStyleId(null);
                        setEditFormData(DEFAULT_FORM_DATA);
                        setEditError("");
                      }}
                      disabled={isEditing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={isEditing || !editFormData.name.trim()}
                    >
                      {isEditing ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </AppShell>
  );
}

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function ColorPickerField({
  label,
  value,
  onChange,
  disabled = false,
}: ColorPickerFieldProps) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2 mt-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-12 h-10 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
