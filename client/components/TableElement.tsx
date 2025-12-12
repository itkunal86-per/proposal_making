import React from "react";

interface TableElementProps {
  id: string;
  rows: number;
  columns: number;
  cells: Array<Array<{ id: string; content: string }>>;
  borderWidth: number;
  borderColor: string;
  headerBackground?: string;
  cellBackground?: string;
  textColor?: string;
  padding: number;
  selected: boolean;
  onSelectCell?: (rowIndex: number, colIndex: number) => void;
  onUpdateCell?: (rowIndex: number, colIndex: number, content: string) => void;
}

export const TableElement: React.FC<TableElementProps> = ({
  id,
  rows,
  columns,
  cells,
  borderWidth,
  borderColor,
  headerBackground = "#f3f4f6",
  cellBackground = "#ffffff",
  textColor = "#000000",
  padding,
  selected,
  onSelectCell,
  onUpdateCell,
}) => {
  return (
    <table
      style={{
        borderCollapse: "collapse",
        width: "100%",
        borderWidth: `${borderWidth}px`,
        borderColor,
        borderStyle: "solid",
        outline: selected ? "2px solid #3b82f6" : "none",
        outlineOffset: "2px",
      }}
    >
      <tbody>
        {cells.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, colIndex) => {
              const isHeaderRow = rowIndex === 0;
              return (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    borderWidth: `${borderWidth}px`,
                    borderColor,
                    borderStyle: "solid",
                    padding: `${padding}px`,
                    backgroundColor: isHeaderRow ? headerBackground : cellBackground,
                    color: textColor,
                    minWidth: "80px",
                    cursor: "text",
                  }}
                >
                  <textarea
                    value={cell.content ?? ""}
                    onChange={(e) =>
                      onUpdateCell?.(rowIndex, colIndex, e.target.value)
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCell?.(rowIndex, colIndex);
                    }}
                    style={{
                      width: "100%",
                      height: "auto",
                      minHeight: "40px",
                      border: "none",
                      backgroundColor: "transparent",
                      color: textColor,
                      fontWeight: isHeaderRow ? "bold" : "normal",
                      resize: "none",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                    }}
                    placeholder={isHeaderRow ? "Header" : ""}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
