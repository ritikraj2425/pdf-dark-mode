'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from './ui/button';
import { Moon, Sun, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

interface FileViewerProps {
  file: File | null;
}

export function FileViewer({ file }: FileViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(1.8);
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const [jumpPage, setJumpPage] = useState('');

  useEffect(() => {
    if (!file || !canvasRef.current) return;

    const loadPDF = async () => {
      const fileReader = new FileReader();
      fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        renderPage(1, pdf);
      };
      fileReader.readAsArrayBuffer(file);
    };

    if (file.type === 'application/pdf') {
      loadPDF();
    }
  }, [file]);

  useEffect(() => {
    if (pdfRef.current) {
      renderPage(currentPage, pdfRef.current);
    }
  }, [currentPage, isDarkMode, scale]);

  const renderPage = async (pageNum: number, pdf: pdfjsLib.PDFDocumentProxy) => {
    const page = await pdf.getPage(pageNum);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const context = canvas.getContext('2d')!;
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    if (isDarkMode) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      context.putImageData(imageData, 0, 0);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    isDragging.current = true;
    lastPosition.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const dx = event.clientX - lastPosition.current.x;
    const dy = event.clientY - lastPosition.current.y;
    containerRef.current.scrollLeft -= dx;
    containerRef.current.scrollTop -= dy;
    lastPosition.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    }
    setJumpPage('');
  };

  if (!file) return null;

  const isPDF = file.type === 'application/pdf';
  if (isPDF) {
    return (
      <div className="fixed inset-0 flex flex-col items-center bg-gray-100 dark:bg-gray-900">
        <div className="sticky top-0 z-10 w-full bg-gray-200 dark:bg-gray-800 py-2 shadow-md flex justify-center gap-4">
          <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">Page {currentPage} of {numPages}</span>
          <Button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <input 
            type="number" 
            value={jumpPage} 
            onChange={(e) => setJumpPage(e.target.value)} 
            className="w-16 text-center border rounded px-2" 
            placeholder="Page" 
          />
          <Button onClick={handleJumpToPage}>Go</Button>
          <Button onClick={() => setScale(s => Math.min(3, s + 0.2))}><ZoomIn className="h-4 w-4" /></Button>
          <Button onClick={() => setScale(s => Math.max(0.5, s - 0.2))}><ZoomOut className="h-4 w-4" /></Button>
          <Button onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {isDarkMode ? 'Light' : 'Dark'}
          </Button>
        </div>
        <div 
          ref={containerRef} 
          className="flex-grow w-full overflow-auto cursor-grab" 
          onMouseDown={handleMouseDown} 
          onMouseMove={handleMouseMove} 
          onMouseUp={handleMouseUp} 
          onMouseLeave={handleMouseUp}>
          <canvas ref={canvasRef} className="mx-auto" />
        </div>
      </div>
    );
  }
  return <p className="text-center p-4">Unsupported file type</p>;
}
