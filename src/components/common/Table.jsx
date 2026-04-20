import React from "react";
import "./Table.css";

const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="table-th">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`table-row ${onRowClick ? "table-row-clickable" : ""}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="table-td">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
