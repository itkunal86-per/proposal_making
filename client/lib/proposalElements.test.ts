import { describe, expect, it } from "vitest";
import {
  contentStylesForLoadedSection,
  coordinateOrZero,
  finiteGeometry,
  normalizeImageElement,
  normalizeShapeElement,
  normalizeTextElement,
} from "./proposalElements";

describe("proposal element geometry", () => {
  it("keeps finite numbers, numeric strings, zero, and negatives", () => {
    expect(finiteGeometry(0)).toBe(0);
    expect(finiteGeometry(-12)).toBe(-12);
    expect(finiteGeometry(" 240 ")).toBe(240);
    expect(finiteGeometry("-8")).toBe(-8);
    expect(finiteGeometry("")).toBeUndefined();
    expect(finiteGeometry("auto")).toBeUndefined();
    expect(finiteGeometry(Number.NaN)).toBeUndefined();
    expect(finiteGeometry(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(coordinateOrZero("auto")).toBe(0);
    expect(coordinateOrZero("-4")).toBe(-4);
  });

  it("preserves fullWidth, lineHeight, and coerced text geometry", () => {
    const text = normalizeTextElement({
      id: 7,
      content: "Hello",
      fontSize: "18",
      fontWeight: true,
      width: "320",
      height: "40",
      top: "12",
      left: 0,
      fullWidth: true,
      lineHeight: "1.2",
    });

    expect(text.fullWidth).toBe(true);
    expect(text.lineHeight).toBe("1.2");
    expect(text.width).toBe(320);
    expect(text.top).toBe(12);
    expect(text.left).toBe(0);
    expect(JSON.parse(JSON.stringify(text))).toMatchObject({
      fullWidth: true,
      lineHeight: "1.2",
      width: 320,
    });
  });

  it("does not invent fullWidth for older text boxes", () => {
    const text = normalizeTextElement({ id: "a", content: "Plain", width: 200, top: 10, left: 10 });
    expect(text.fullWidth).toBeUndefined();
    expect(text.width).toBe(200);
    expect(JSON.parse(JSON.stringify(text)).fullWidth).toBeUndefined();
    expect(text.aiRole).toBeUndefined();
  });

  it("keeps aiRole only when it is static or editable", () => {
    expect(normalizeTextElement({ id: "a", content: "", top: 0, left: 0, aiRole: "static" }).aiRole).toBe("static");
    expect(normalizeTextElement({ id: "b", content: "", top: 0, left: 0, aiRole: "editable" }).aiRole).toBe("editable");
    expect(normalizeTextElement({ id: "c", content: "", top: 0, left: 0, aiRole: "user_selected" }).aiRole).toBeUndefined();
  });

  it("keeps numeric image and shape dimensions and coerces numeric strings", () => {
    const image = normalizeImageElement({
      id: "img",
      url: "https://files.example/a.png",
      width: "180",
      height: 90,
      top: "24",
      left: "16",
      source: { provider: "crm", fileId: 5, organizationId: 10 },
    });
    expect(image).toMatchObject({
      url: "https://files.example/a.png",
      width: 180,
      height: 90,
      top: 24,
      left: 16,
      source: { provider: "crm", fileId: 5, organizationId: 10 },
    });

    const shape = normalizeShapeElement({
      id: "sq",
      type: "square",
      width: 140,
      height: "60",
      backgroundColor: "#111111",
      top: 0,
      left: "-5",
    });
    expect(shape.width).toBe(140);
    expect(shape.height).toBe(60);
    expect(shape.top).toBe(0);
    expect(shape.left).toBe(-5);
  });

  it("does not replace explicit section styles with defaults", () => {
    const explicit = { backgroundColor: "#111111", paddingTop: "0" };
    expect(contentStylesForLoadedSection(explicit, undefined, false)).toEqual(explicit);
    expect(contentStylesForLoadedSection(undefined, undefined, false)).toBeUndefined();
    expect(contentStylesForLoadedSection(explicit, { backgroundColor: "#eeeeee" }, true)).toEqual({
      backgroundColor: "#eeeeee",
    });
    expect(contentStylesForLoadedSection({}, undefined, false)).toEqual({});
  });
});
