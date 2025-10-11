"use client";

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';

const CrucibleInlet: React.FC<{ onFileUpload: (files: File[]) => void }> = ({ onFileUpload }) => {
  const { onDrop, files, status, progress, error } = useDocumentUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onDrop(acceptedFiles);
      onFileUpload(acceptedFiles);
    },
    // Add file validation here if needed (e.g., maxSize, accept)
  });

  return (
    <div
      {...getRootProps()}
      className="w-full h-full border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center text-center p-8 transition-colors duration-300 ease-in-out"
      style={{
        backgroundColor: isDragActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      }}
    >
      <input {...getInputProps()} />
      {status === 'UPLOADING' ? (
        <div className="w-full">
          <p>Forging in progress...</p>
          <div
            className="w-full bg-gray-700 rounded-full h-2.5 mt-4"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
              data-testid="progress-indicator"
            ></div>
          </div>
          <p className="mt-2">{progress}%</p>
        </div>
      ) : (
        <div>
          {isDragActive ? (
            <p>Release to drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
          {files.length > 0 && (
            <div className="mt-4">
              <h4>Selected Files:</h4>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default CrucibleInlet;