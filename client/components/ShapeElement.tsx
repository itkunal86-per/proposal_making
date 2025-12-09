import React from "react";

interface ShapeElementProps {
  id: string;
  type: "square" | "circle" | "triangle";
  width: number;
  height: number;
  backgroundColor: string;
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
    "cursor-pointer transition-all duration-200 outline-2 outline-offset-2 absolute";
  const selectedClasses = selected
    ? "outline outline-blue-500 bg-blue-50/50"
    : "hover:outline hover:outline-gray-300 hover:outline-offset-2";

  const renderShape = () => {
    const commonStyle: React.CSSProperties = {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor,
      borderWidth: borderWidth ? `${borderWidth}px` : "0px",
      borderColor,
      borderStyle: borderWidth ? "solid" : "none",
    };

    switch (type) {
      case "circle":
        return (
          <div
            onClick={onSelect}
            className={`${baseClasses} ${selectedClasses}`}
            style={{
              ...commonStyle,
              borderRadius: "50%",
            }}
          />
        );
      case "triangle":
        return (
          <div
            onClick={onSelect}
            className={`${baseClasses} ${selectedClasses}`}
            style={{
              width: 0,
              height: 0,
              borderLeft: `${width / 2}px solid transparent`,
              borderRight: `${width / 2}px solid transparent`,
              borderBottom: `${height}px solid ${backgroundColor}`,
              position: "absolute",
              borderTopWidth: 0,
              borderBottomWidth: `${height}px`,
              borderLeftWidth: `${width / 2}px`,
              borderRightWidth: `${width / 2}px`,
              borderTopStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid",
              borderRightStyle: "solid",
              borderTopColor: "transparent",
              borderBottomColor: backgroundColor,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
            } as React.CSSProperties}
          />
        );
      case "square":
      default:
        return (
          <div
            onClick={onSelect}
            className={`${baseClasses} ${selectedClasses}`}
            style={{
              ...commonStyle,
              borderRadius: `${borderRadius}px`,
            }}
          />
        );
    }
  };

  return renderShape();
};
