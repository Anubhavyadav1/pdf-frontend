import React, { useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import './PDFViewer.css';

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${process.env.REACT_APP_PDFJS_VERSION || "2.16.105"}/pdf.worker.min.js`;

const PDFViewer = ({ fileUrl }) => {
  const viewerRef = useRef();
  const [issues, setIssues] = useState([]);

  // Fetch issues from JSON file
  useEffect(() => {
    fetch('/issues.json')
      .then(response => response.json())
      .then(data => setIssues(data))
      .catch(error => console.error('Error loading issues:', error));
  }, []);

  const createOverlay = (issue, viewport, pageWrapper) => {
    const [x1, y1, x2, y2] = issue.coordinates;
    
    const overlay = document.createElement("div");
    overlay.className = "pdf-overlay";
    overlay.style.position = "absolute";
    overlay.style.left = `${x1 * viewport.scale}px`;
    overlay.style.top = `${y1 * viewport.scale}px`;
    overlay.style.width = `${(x2 - x1) * viewport.scale}px`;
    overlay.style.height = `${(y2 - y1) * viewport.scale}px`;
    
    const categoryColors = {
      TYPOS: "rgba(255, 0, 0, 0.1)",
      GRAMMAR: "rgba(0, 255, 0, 0.1)",
      TYPOGRAPHY: "rgba(0, 0, 255, 0.1)",
      MISC: "rgba(255, 165, 0, 0.1)"
    };
    
    overlay.style.backgroundColor = categoryColors[issue.category] || "rgba(255, 0, 0, 0.1)";
    overlay.style.border = "1px solid rgba(0, 0, 0, 0.3)";
    overlay.style.cursor = "pointer";
    overlay.style.zIndex = "1000";
    
    const tooltip = document.createElement("div");
    tooltip.className = "pdf-tooltip";
    tooltip.style.display = "none";
    tooltip.style.position = "absolute";
    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    tooltip.style.color = "white";
    tooltip.style.padding = "5px 10px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.fontSize = "12px";
    tooltip.style.maxWidth = "200px";
    tooltip.style.zIndex = "1001";
    tooltip.innerHTML = `
      <strong>${issue.category}</strong><br>
      ${issue.message}<br>
      <em>Suggestions: ${issue.suggestions.join(", ")}</em>
    `;
    
    overlay.onmouseover = (e) => {
      tooltip.style.display = "block";
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
    };
    
    overlay.onmousemove = (e) => {
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
    };
    
    overlay.onmouseout = () => {
      tooltip.style.display = "none";
    };
    
    overlay.onclick = () => {
      alert(`
        Category: ${issue.category}
        Issue: ${issue.message}
        Suggestions: ${issue.suggestions.join(", ")}
        Context: "${issue.context}"
        Page: ${issue.page}
      `);
    };
    
    pageWrapper.appendChild(overlay);
    document.body.appendChild(tooltip);
  };

  useEffect(() => {
    const loadPDF = async () => {
      try {
        if (viewerRef.current) {
          viewerRef.current.innerHTML = '';
        }

        const pdf = await getDocument(fileUrl).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.7 });

          const pageWrapper = document.createElement("div");
          pageWrapper.className = "pdf-page-wrapper";
          pageWrapper.style.position = "relative";
          pageWrapper.style.width = `${viewport.width}px`;
          pageWrapper.style.height = `${viewport.height}px`;
          pageWrapper.style.marginBottom = "20px";
          viewerRef.current.appendChild(pageWrapper);

          const canvas = document.createElement("canvas");
          canvas.className = "pdf-page";
          pageWrapper.appendChild(canvas);

          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;

          // Filter issues for current page and create overlays
          const pageIssues = issues.filter(issue => issue.page === pageNum);
          pageIssues.forEach(issue => {
            createOverlay(issue, viewport, pageWrapper);
          });
        }
      } catch (error) {
        console.error("Error loading or rendering PDF:", error);
      }
    };

    if (issues.length > 0) {
      loadPDF();
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.innerHTML = '';
      }
      document.querySelectorAll('.pdf-tooltip').forEach(tooltip => tooltip.remove());
    };
  }, [fileUrl, issues]);

  return (
    <div
      ref={viewerRef}
      className="pdf-viewer"
      style={{ 
        overflowY: "auto", 
        height: "100%", 
        position: "relative",
        padding: "20px"
      }}
    />
  );
};

export default PDFViewer;