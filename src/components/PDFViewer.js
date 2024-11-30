import React, { useEffect, useRef } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

// Set the workerSrc to the correct path
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${process.env.REACT_APP_PDFJS_VERSION || "2.16.105"}/pdf.worker.min.js`;

const PDFViewer = ({ fileUrl }) => {
  const viewerRef = useRef();

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const pdf = await getDocument(fileUrl).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);

          const canvas = document.createElement("canvas");
          canvas.className = "pdf-page";
          viewerRef.current.appendChild(canvas);

          const context = canvas.getContext("2d");
          const viewport = page.getViewport({ scale: 1.7 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;

          // Add overlay for specific coordinates
          if (i === 1) {
            const overlay = document.createElement("div");
            overlay.className = "pdf-overlay";
            overlay.style.position = "absolute";
            overlay.style.left = `${10 * viewport.scale}px`; // Convert coordinates to scaled units
            overlay.style.top = `${10 * viewport.scale}px`;
            overlay.style.width = `${5 * viewport.scale}px`; // Length of the overlay
            overlay.style.height = `${5 * viewport.scale}px`; // Optional height
            overlay.style.backgroundColor = "rgba(255, 0, 0, 0.3)"; // Semi-transparent red
            overlay.style.border = "1px solid rgba(255, 0, 0, 0.8)";
            overlay.style.cursor = "pointer";
            overlay.onclick = () => alert("Overlay clicked!");

            viewerRef.current.appendChild(overlay);
          }
        }
      } catch (error) {
        console.error("Error loading or rendering PDF:", error);
      }
    };

    loadPDF();
  }, [fileUrl]);

  return (
    <div
      ref={viewerRef}
      className="pdf-viewer"
      style={{ overflowY: "auto", height: "100%", position: "relative" }}
    />
  );
};

export default PDFViewer;
