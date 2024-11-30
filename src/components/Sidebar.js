import React from "react";

const Sidebar = ({ annotations, selectedAnnotation, onDescriptionChange }) => {
  return (
    <div style={{ padding: "10px", overflowY: "auto", background: "#f9f9f9" }}>
      <h3>Annotations</h3>
      {annotations.map((annotation, index) => (
        <div key={index} style={{ marginBottom: "15px" }}>
          <strong>Page:</strong> {annotation.page} <br />
          <strong>Text:</strong> {annotation.text} <br />
          <strong>Description:</strong>
          {selectedAnnotation === index ? (
            <textarea
              value={annotation.description}
              onChange={(e) => onDescriptionChange(index, e.target.value)}
              rows="2"
              style={{ width: "100%", marginTop: "5px" }}
            />
          ) : (
            <p>{annotation.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
