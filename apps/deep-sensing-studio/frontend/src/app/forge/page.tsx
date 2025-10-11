"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CrucibleInlet from '../../components/forge/CrucibleInlet';
import ForgeButton from '../../components/forge/ForgeButton';
import AnvilSearch from '../../components/forge/AnvilSearch';
import AnvilResults from '../../components/forge/AnvilResults';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { useSemanticSearch, SearchResult } from '../../hooks/useSemanticSearch';

type ForgeState = 'CRUCIBLE' | 'ANVIL';

const ForgePage: React.FC = () => {
  const [forgeState, setForgeState] = useState<ForgeState>('CRUCIBLE');

  const upload = useDocumentUpload();
  const search = useSemanticSearch();

  const handleForgeClick = async () => {
    await upload.uploadFiles();
    if (upload.status === 'SUCCESS') {
      setForgeState('ANVIL');
    }
  };

  const isForgeButtonDisabled = useMemo(() => {
    return upload.files.length === 0 || upload.status === 'UPLOADING';
  }, [upload.files.length, upload.status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <AnimatePresence mode="wait">
        {forgeState === 'CRUCIBLE' ? (
          <motion.div
            key="crucible"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl flex flex-col items-center"
          >
            <CrucibleInlet onFileUpload={upload.onDrop} />
            <div className="mt-8">
              <ForgeButton
                onClick={handleForgeClick}
                status={upload.status}
                disabled={isForgeButtonDisabled}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="anvil"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl flex flex-col items-center"
          >
            <AnvilSearch />
            <AnvilResults results={search.results} status={search.status} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgePage;