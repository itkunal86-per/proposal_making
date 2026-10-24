import { readOrganizationSource } from "@/lib/organizationMedia";
import type { ImageElement, ShapeElement, SignatureField, TableElement, TextElement } from "@/services/proposalsService";

/** Finite numbers and numeric strings. Zero and negatives stay. NaN and Infinity do not. */
export function finiteGeometry(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/** Missing or invalid coordinates use the existing 0 default. */
export function coordinateOrZero(value: unknown): number {
  const parsed = finiteGeometry(value);
  return parsed === undefined ? 0 : parsed;
}

export function normalizeTextElement(text: any): TextElement {
  const normalized: TextElement = {
    id: String(text?.id ?? ""),
    content: text?.content ?? "",
    fontSize: text?.fontSize,
    color: text?.color,
    fontWeight: typeof text?.fontWeight === "boolean" ? text.fontWeight : undefined,
    backgroundColor: text?.backgroundColor,
    backgroundOpacity: text?.backgroundOpacity,
    borderColor: text?.borderColor,
    borderWidth: text?.borderWidth,
    borderRadius: text?.borderRadius,
    paddingTop: text?.paddingTop,
    paddingRight: text?.paddingRight,
    paddingBottom: text?.paddingBottom,
    paddingLeft: text?.paddingLeft,
    width: finiteGeometry(text?.width),
    height: finiteGeometry(text?.height),
    top: coordinateOrZero(text?.top),
    left: coordinateOrZero(text?.left),
  };
  if (typeof text?.fullWidth === "boolean") normalized.fullWidth = text.fullWidth;
  if (text?.lineHeight != null && text.lineHeight !== "") normalized.lineHeight = String(text.lineHeight);
  if (text?.aiRole === "static" || text?.aiRole === "editable") normalized.aiRole = text.aiRole;
  return normalized;
}

export function normalizeShapeElement(shape: any): ShapeElement {
  return {
    id: String(shape?.id ?? ""),
    type: shape?.type,
    width: finiteGeometry(shape?.width) as number,
    height: finiteGeometry(shape?.height) as number,
    backgroundColor: shape?.backgroundColor,
    backgroundImage: shape?.backgroundImage,
    backgroundSize: shape?.backgroundSize,
    backgroundOpacity: shape?.backgroundOpacity,
    borderWidth: finiteGeometry(shape?.borderWidth),
    borderColor: shape?.borderColor,
    borderRadius: finiteGeometry(shape?.borderRadius),
    top: coordinateOrZero(shape?.top),
    left: coordinateOrZero(shape?.left),
  };
}

export function normalizeImageElement(image: any): ImageElement {
  const source = readOrganizationSource(image?.source);
  return {
    id: String(image?.id ?? ""),
    url: image?.url,
    width: finiteGeometry(image?.width) as number,
    height: finiteGeometry(image?.height) as number,
    opacity: image?.opacity,
    borderWidth: finiteGeometry(image?.borderWidth),
    borderColor: image?.borderColor,
    borderRadius: finiteGeometry(image?.borderRadius),
    top: coordinateOrZero(image?.top),
    left: coordinateOrZero(image?.left),
    ...(source ? { source } : {}),
  };
}

export function normalizeTableElement(table: any): TableElement {
  return {
    id: String(table?.id ?? ""),
    rows: table?.rows,
    columns: table?.columns,
    cells: (table?.cells ?? []).map((row: any[]) =>
      (row ?? []).map((cell) => ({
        id: String(cell?.id ?? ""),
        content: cell?.content ?? "",
      })),
    ),
    borderWidth: table?.borderWidth,
    borderColor: table?.borderColor,
    headerBackground: table?.headerBackground,
    cellBackground: table?.cellBackground,
    textColor: table?.textColor,
    padding: table?.padding,
    width: finiteGeometry(table?.width) as number,
    height: finiteGeometry(table?.height) as number,
    top: coordinateOrZero(table?.top),
    left: coordinateOrZero(table?.left),
  };
}

export function normalizeSignatureField(field: any): SignatureField {
  return {
    id: String(field?.id ?? ""),
    recipientId: String(field?.recipientId || field?.recipient_id || ""),
    sectionId: String(field?.sectionId || field?.section_id || ""),
    width: finiteGeometry(field?.width) as number,
    height: finiteGeometry(field?.height) as number,
    top: coordinateOrZero(field?.top),
    left: coordinateOrZero(field?.left),
    status: field?.status,
    signedAt: field?.signedAt || field?.signed_at,
    signatureData: field?.signatureData || field?.signature_data,
    signatureDisplayText: field?.signatureDisplayText || field?.signature_display_text,
    borderColor: field?.borderColor || field?.border_color,
    borderWidth: finiteGeometry(field?.borderWidth ?? field?.border_width),
    borderRadius: finiteGeometry(field?.borderRadius ?? field?.border_radius),
    fullName: field?.fullName || field?.full_name,
    email: field?.email,
    position: field?.position,
    signature: field?.signature,
    signedByUserId: field?.signedByUserId || field?.signed_by_user_id,
    ...(field?.purpose ? { purpose: field.purpose } : {}),
  };
}

/**
 * A matching local section may keep styles edited in this browser.
 * An unmatched API section keeps the API styles and does not gain synthetic defaults.
 */
export function contentStylesForLoadedSection(
  apiStyles: Record<string, any> | undefined,
  localStyles: Record<string, any> | undefined,
  hasMatchingLocalSection: boolean,
): Record<string, any> | undefined {
  if (hasMatchingLocalSection && localStyles) return localStyles;
  return apiStyles;
}
