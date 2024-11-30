import React, { useEffect, useRef } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

// Set the workerSrc to the correct path
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${process.env.REACT_APP_PDFJS_VERSION || "2.16.105"}/pdf.worker.min.js`;

const PDFViewer = ({ fileUrl, annotations, onHighlight, onOverlayClick }) => {
  const viewerRef = useRef();

  useEffect(() => {
    const loadPDF = async () => {
      try {
        // Get the PDF document
        const pdf = await getDocument(fileUrl).promise;

        // Render each page of the PDF
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);

          // Create a canvas for each page
          const canvas = document.createElement("canvas");
          canvas.className = "pdf-page";
          canvas.dataset.page = i;
          viewerRef.current.appendChild(canvas);

          // Render the page on the canvas
          const context = canvas.getContext("2d");
          const viewport = page.getViewport({ scale: 1.7 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
        }
      } catch (error) {
        console.error("Error loading or rendering PDF:", error);
      }
    };

    loadPDF();
  }, [fileUrl]);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const text = selection.toString();
      const rect = range.getBoundingClientRect();
      const page = range.startContainer.parentNode.dataset.page || 1;
      const { left, top, width, height } = rect;

      onHighlight({
        text,
        page: parseInt(page, 10),
        rect: { left, top, width, height },
      });
    }
  };

  return (
    <div
      ref={viewerRef}
      className="pdf-viewer"
      onMouseUp={handleTextSelect}
      style={{ overflowY: "auto", height: "100%", position: "relative" }}
    >
      {annotations.map((annotation, index) => (
        <div
          key={index}
          className="overlay"
          style={{
            position: "absolute",
            top: `${annotation.rect.top}px`,
            left: `${annotation.rect.left}px`,
            width: `${annotation.rect.width}px`,
            height: `${annotation.rect.height}px`,
            backgroundColor: "rgba(255, 255, 0, 0.4)", // Highlight color
            cursor: "pointer",
          }}
          onClick={() => onOverlayClick(index)}
        />
      ))}
    </div>
  );
};

export default PDFViewer;
