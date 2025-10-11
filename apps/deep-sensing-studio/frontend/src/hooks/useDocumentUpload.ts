import { useState, useCallback } from 'react';

type UploadStatus = 'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR';

interface UploadState {
  files: File[];
  status: UploadStatus;
  progress: number;
  error: string | null;
}

export const useDocumentUpload = () => {
  const [state, setState] = useState<UploadState>({
    files: [],
    status: 'IDLE',
    progress: 0,
    error: null,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setState(prevState => ({
      ...prevState,
      files: acceptedFiles,
      status: 'IDLE',
      error: null,
    }));
  }, []);

  const uploadFiles = async () => {
    if (state.files.length === 0) return;

    setState(prevState => ({ ...prevState, status: 'UPLOADING', progress: 0, error: null }));

    const formData = new FormData();
    state.files.forEach(file => {
      formData.append('files', file);
    });

    try {
      // Mocking the upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setState(prevState => ({ ...prevState, progress: i }));
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setState(prevState => ({ ...prevState, status: 'SUCCESS', progress: 100 }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  };

  return { ...state, onDrop, uploadFiles };
};