import React from "react";

export interface ImageData {
  id: string;
  url: string;
  width: number;
  height: number;
  opacity?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  top: number;
  left: number;
}

interface ImageElementProps extends ImageData {
  selected: boolean;
  onSelect: () => void;
}

export const ImageElement: React.FC<ImageElementProps> = ({
  id,
  url,
  width,
  height,
  opacity = "100",
  borderWidth = 0,
  borderColor = "#000000",
  borderRadius = 0,
  top,
  left,
  selected,
  onSelect,
}) => {
  const opacityValue = parseInt(opacity) / 100;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        opacity: opacityValue,
        borderWidth: borderWidth ? `${borderWidth}px` : "2px",
        borderColor: borderColor || "#d1d5db",
        borderStyle: "solid",
        borderRadius: borderRadius ? `${borderRadius}px` : "4px",
        outline: selected ? "2px solid #3b82f6" : "none",
        outlineOffset: "2px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        color: "#6b7280",
        fontWeight: "500",
        overflow: "hidden",
        backgroundColor: url ? "transparent" : "#f3f4f6",
      }}
    >
      {url ? (
        <img
          src={url}
          alt="Element"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            pointerEvents: "none",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        "Click to add image URL"
      )}
    </div>
  );
};
