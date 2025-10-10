import React from 'react';
import { useDropzone } from 'react-dropzone';
import * as Progress from '@radix-ui/react-progress';
import clsx from 'clsx';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import styles from './DocumentUpload.module.css';

export const DocumentUpload: React.FC = () => {
  const { uploadState, onDrop } = useDocumentUpload();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className={styles.wrapper}>
      <div
        {...getRootProps()}
        className={clsx(styles.dropzone, { [styles.dropzoneActive]: isDragActive })}
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
        <small>PDF, JPG, PNG, TXT up to 50MB. Max 10 files.</small>
      </div>

      {uploadState.error && <p className={styles.error}>{uploadState.error}</p>}

      {uploadState.isUploading && (
        <div className={styles.progressWrapper}>
          <p>Uploading {uploadState.files.length} file(s)...</p>
          <Progress.Root value={uploadState.progress} style={{ height: '10px', width: '100%', backgroundColor: 'var(--color-cream)' }}>
            <Progress.Indicator
              className={styles.progressIndicator}
              style={{ width: `${uploadState.progress}%`, height: '100%' }}
            />
          </Progress.Root>
          <p>Efficiency Multiplier: 1.618x (Williams Optimizer)</p>
        </div>
      )}

      {!uploadState.isUploading && uploadState.files.length > 0 && (
        <div>
          <h4>Selected Files:</h4>
          <ul className={styles.fileList}>
            {uploadState.files.map((file, i) => (
              <li key={i} className={styles.fileItem}>
                {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};