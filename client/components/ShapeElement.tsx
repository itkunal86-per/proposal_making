import React from "react";

interface ShapeElementProps {
  id: string;
  type: "square" | "circle" | "triangle";
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundOpacity?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  selected: boolean;
  onSelect: () => void;
}

export const ShapeElement: React.FC<ShapeElementProps> = ({
  id,
  type,
  width,
  height,
  backgroundColor,
  borderWidth = 0,
  borderColor = "#000000",
  borderRadius = 0,
  selected,
  onSelect,
}) => {
  const baseClasses =
    "cursor-pointer transition-all duration-200 outline-2 outline-offset-2";
  const selectedClasses = selected
    ? "outline outline-blue-500"
    : "hover:outline hover:outline-gray-300 hover:outline-offset-2";

  const renderShape = () => {
    const baseStyle: React.CSSProperties = {
      cursor: "pointer",
      display: "inline-block",
    };

    const outlineStyle: React.CSSProperties = {
      outline: selected ? "2px solid #3b82f6" : "none",
      outlineOffset: "2px",
    };

    switch (type) {
      case "circle":
        return (
          <div
            onClick={onSelect}
            className={baseClasses}
            style={{
              ...baseStyle,
              ...outlineStyle,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor,
              borderRadius: "50%",
              borderWidth: borderWidth ? `${borderWidth}px` : "0px",
              borderColor,
              borderStyle: borderWidth ? "solid" : "none",
            }}
          />
        );
      case "triangle":
        return (
          <div
            onClick={onSelect}
            className={baseClasses}
            style={{
              ...baseStyle,
              ...outlineStyle,
              width: 0,
              height: 0,
              borderLeft: `${width / 2}px solid transparent`,
              borderRight: `${width / 2}px solid transparent`,
              borderBottom: `${height}px solid ${backgroundColor}`,
            }}
          />
        );
      case "square":
      default:
        return (
          <div
            onClick={onSelect}
            className={baseClasses}
            style={{
              ...baseStyle,
              ...outlineStyle,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor,
              borderRadius: `${borderRadius}px`,
              borderWidth: borderWidth ? `${borderWidth}px` : "0px",
              borderColor,
              borderStyle: borderWidth ? "solid" : "none",
            }}
          />
        );
    }
  };

  return renderShape();
};
