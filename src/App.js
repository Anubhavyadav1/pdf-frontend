// src/App.js
import React, { useState } from "react";
import PDFViewer from "./components/PDFViewer";
import Sidebar from "./components/Sidebar";
import "./index.css";

const App = () => {
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);

  const handleHighlight = (annotation) => {
    setAnnotations((prev) => [
      ...prev,
      { ...annotation, description: "No description yet." },
    ]);
  };

  const handleDescriptionChange = (index, description) => {
    setAnnotations((prev) =>
      prev.map((ann, i) => (i === index ? { ...ann, description } : ann))
    );
  };

  const handleOverlayClick = (annotationIndex) => {
    setSelectedAnnotation(annotationIndex);
  };

  return (
    <div className="container">
      <div className="viewer">
        <PDFViewer
          fileUrl="suicide.pdf"
          annotations={annotations}
          onHighlight={handleHighlight}
          onOverlayClick={handleOverlayClick}
        />
      </div>
      <Sidebar
        annotations={annotations}
        selectedAnnotation={selectedAnnotation}
        onDescriptionChange={handleDescriptionChange}
      />
    </div>
  );
};

export default App;
