"use client";

import React from 'react';

interface ForgeButtonProps {
  onClick: () => void;
  status: 'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR';
  disabled: boolean;
}

const ForgeButton: React.FC<ForgeButtonProps> = ({ onClick, status, disabled }) => {
  const getButtonText = () => {
    switch (status) {
      case 'UPLOADING':
        return 'FORGING...';
      case 'SUCCESS':
        return 'SUCCESS!';
      case 'ERROR':
        return 'RETRY';
      default:
        return 'FORGE';
    }
  };

  return (
    // @asymmetrica: a = (σ: "triggerForge", ρ: "UI:Crucible", γ: "Exploration", κ: "O(1)", λ: "[UI.ForgeButton.click → API.POST:/documents]")
    <button
      onClick={onClick}
      disabled={disabled || status === 'UPLOADING'}
      className="px-8 py-4 bg-gray-800 text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
      style={{
        animation: status === 'UPLOADING' ? 'tesla-pulse 2s infinite' : 'none',
      }}
    >
      {getButtonText()}
    </button>
  );
};

export default ForgeButton;