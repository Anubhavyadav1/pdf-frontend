import React from "react";
import PDFViewer from "./components/PDFViewer";
import "./index.css";

const App = () => {
  return (
    <div className="container">
      <div className="viewer">
        <PDFViewer fileUrl="suicide.pdf" />
      </div>
    </div>
  );
};

export default App;
