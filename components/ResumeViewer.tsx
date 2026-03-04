"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumeViewerProps {
  pdfUrl: string;
}

export default function ResumeViewer({ pdfUrl }: ResumeViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    setContainerWidth(el.clientWidth);

    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
    setLoading(false);
    setErrorMessage(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setLoading(false);
    setErrorMessage(error.message || "Unable to load the resume right now.");
  }, []);

  return (
    <div ref={containerRef} className="resume-viewer">
      {loading && (
        <div className="resume-viewer__loader">
          <div className="resume-viewer__spinner" />
          <p>Loading resume&hellip;</p>
        </div>
      )}

      {errorMessage && (
        <div className="resume-viewer__error">
          <p>Unable to load the resume preview.</p>
          <p className="resume-viewer__error-hint">{errorMessage}</p>
          <p className="resume-viewer__error-hint">
            Use the <strong>Download PDF</strong> button above as a fallback.
          </p>
        </div>
      )}

      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
      >
        {numPages &&
          Array.from({ length: numPages }, (_, i) => (
            <Page
              key={`page_${i + 1}`}
              pageNumber={i + 1}
              width={containerWidth || undefined}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="resume-viewer__page"
            />
          ))}
      </Document>

      <style jsx global>{`
        .resume-viewer {
          position: relative;
          min-height: 300px;
        }

        .resume-viewer__loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 4rem 1rem;
          color: #64748b;
          font-size: 0.95rem;
        }

        .resume-viewer__spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: rv-spin 0.8s linear infinite;
        }

        @keyframes rv-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .resume-viewer__error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 4rem 1rem;
          text-align: center;
          color: #64748b;
        }

        .resume-viewer__error-hint {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .resume-viewer__page {
          margin-bottom: 0;
        }

        .resume-viewer__page canvas {
          display: block;
          width: 100% !important;
          height: auto !important;
        }

        .react-pdf__Document {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
