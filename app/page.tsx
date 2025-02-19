'use client';

import { useState } from 'react';
import { FileViewer } from '@/components/file-viewer';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="w-full max-w-2xl text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Upload your document
        </h2>
        <p className="text-muted-foreground">
          Support for PDFs and images. Toggle dark mode for comfortable reading.
        </p>
      </div>

      <div className="w-full max-w-md">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PDF or Image files</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>

     
        <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
          <h3 className="text-xl font-semibold">Image Transformation</h3>
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-muted-foreground text-center">Original</p>
              <img src='pre.png' alt="Original" className="w-full h-auto rounded-lg shadow-lg" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground text-center">Transformed</p>
              <img src='trans.png' alt="Transformed" className="w-full h-auto rounded-lg shadow-lg" />
            </div>
          </div>
        </div>

      {file && (
        <div className="w-full">
          <FileViewer file={file} />
        </div>
      )}
    </div>
  );
}