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

  return (
    <div
      onClick={onSelect}
      style={{
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        opacity: opacityValue,
        borderWidth: borderWidth ? `${borderWidth}px` : "0px",
        borderColor,
        borderStyle: borderWidth ? "solid" : "none",
        borderRadius: borderRadius ? `${borderRadius}px` : "0",
        outline: selected ? "2px solid #3b82f6" : "none",
        outlineOffset: "2px",
        cursor: "pointer",
        backgroundImage: `url(${url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};
