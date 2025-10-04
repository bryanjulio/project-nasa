"use client";

import { useState } from "react";

export function useAISearch() {
  const [isOpen] = useState(true); // Always open

  const openModal = () => {}; // No-op since modal is always open
  const closeModal = () => {}; // No-op since modal can't be closed

  return {
    isOpen,
    openModal,
    closeModal,
  };
}
