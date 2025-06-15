"use client";

import React, { useRef, useState } from "react";
import { getAcceptedFileTypes, getAllSupportedExtensions } from '@/lib/generator_const';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HiOutlineInformationCircle } from 'react-icons/hi';

interface FileLoaderProps {
  files: File[]; 
  setFiles: React.Dispatch<React.SetStateAction<File[]>>; 
  inputType?: string;
  usePrecisePDFMode?: boolean;
  setUsePrecisePDFMode?: (value: boolean) => void;
}

const FileLoader: React.FC<FileLoaderProps> = ({ 
  files, 
  setFiles, 
  inputType = "All",
  usePrecisePDFMode = false,
  setUsePrecisePDFMode
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showAllFormats, setShowAllFormats] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  let accept = inputType === "All" ? getAllSupportedExtensions() : getAcceptedFileTypes(inputType as any);
  
  // Format the accept string to be more readable
  const formatAcceptString = (formats: string) => {
    const allFormats = formats.split(',');
    if (!showAllFormats) {
      const commonFormats = ['.pdf', '.docx', '.txt', '.pptx'];
      const visibleFormats = allFormats.filter(format => commonFormats.includes(format));
      return visibleFormats.join(', ') + ' and more...';
    }
    return allFormats.join(', ');
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    setError("");
    if (e.target.files) handleFiles(Array.from(e.target.files));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");
    if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files));
  }

  function handleFiles(newFiles: File[]) {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    newFiles.forEach(file => {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (accept.includes(ext)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`Unsupported file types: ${invalidFiles.join(', ')}`);
    }
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 
          ${dragActive 
            ? "border-blue-500 bg-blue-50/50" 
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
          }
        `}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleChange}
          accept={accept}
        />
        
        <div className="p-8 text-center">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-blue-500" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Drag & drop your files here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                browse
              </button>
            </p>
            <div className="mt-1.5 flex flex-col items-center">
              <p className="text-xs text-gray-500">
                Supported formats: {formatAcceptString(accept)}
              </p>
              <button
                type="button"
                onClick={() => setShowAllFormats(!showAllFormats)}
                className="text-xs text-blue-500 hover:text-blue-600 mt-0.5"
              >
                {showAllFormats ? 'Show less' : 'Show all formats'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <>
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-200 group hover:border-gray-300 transition-colors"
              >
                <span className="text-sm text-gray-600 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {setUsePrecisePDFMode && (
            <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <input
                type="checkbox"
                id="precisePDFMode"
                checked={usePrecisePDFMode}
                onChange={(e) => setUsePrecisePDFMode(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <label htmlFor="precisePDFMode" className="block text-sm font-medium text-gray-700">
                    Use precise mode for PDFs
                  </label>
                  <HiOutlineInformationCircle className="h-4 w-4 text-gray-400" />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Slower but recommended for documents with complex formatting, math formulas, tables, or images. Processing time may be significantly longer.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileLoader;