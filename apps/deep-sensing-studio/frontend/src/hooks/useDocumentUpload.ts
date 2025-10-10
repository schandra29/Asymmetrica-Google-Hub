import { useState, useCallback } from 'react';

// Define the shape of the upload state
interface UploadState {
  files: File[];
  progress: number; // Percentage from 0 to 100
  error: string | null;
  isUploading: boolean;
}

// Define validation parameters
const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 50;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];

export const useDocumentUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    files: [],
    progress: 0,
    error: null,
    isUploading: false,
  });

  const validateFiles = (files: File[]): string | null => {
    if (files.length > MAX_FILES) {
      return `Cannot upload more than ${MAX_FILES} files at once.`;
    }
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return `File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return `File type for "${file.name}" is not supported.`;
      }
    }
    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validationError = validateFiles(acceptedFiles);
    if (validationError) {
      setUploadState(prevState => ({ ...prevState, error: validationError }));
      return;
    }

    setUploadState({
      files: acceptedFiles,
      progress: 0,
      error: null,
      isUploading: true,
    });

    // Mock API upload process
    const uploadSimulation = () => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress > 100) {
          clearInterval(interval);
          setUploadState(prevState => ({ ...prevState, isUploading: false, progress: 100 }));
        } else {
          setUploadState(prevState => ({ ...prevState, progress: currentProgress }));
        }
      }, 200); // Mimics network speed
    };

    uploadSimulation();
    // In a real implementation, you would use fetch API here:
    // uploadFiles(acceptedFiles);
  }, []);

  // Placeholder for the actual fetch call
  // const uploadFiles = async (files: File[]) => {
  //   const formData = new FormData();
  //   files.forEach(file => formData.append('files', file));
  //
  //   try {
  //     const response = await fetch('/api/documents', {
  //       method: 'POST',
  //       body: formData,
  //     });
  //
  //     if (!response.ok) {
  //       throw new Error('Upload failed');
  //     }
  //
  //     // Handle success
  //   } catch (error) {
  //     setUploadState(prevState => ({ ...prevState, error: error.message, isUploading: false }));
  //   }
  // };

  return { uploadState, onDrop };
};