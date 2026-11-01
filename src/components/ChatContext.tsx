'use client';

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface ChatContextValue {
  isOpen: boolean;
  prefilledPrompt: string;
  openChat: (prompt?: string) => void;
  closeChat: () => void;
  clearPrefill: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledPrompt, setPrefilledPrompt] = useState('');

  const value = useMemo(
    () => ({
      isOpen,
      prefilledPrompt,
      openChat: (prompt?: string) => {
        if (prompt !== undefined) {
          setPrefilledPrompt(prompt);
        }
        setIsOpen(true);
      },
      closeChat: () => {
        setIsOpen(false);
      },
      clearPrefill: () => {
        setPrefilledPrompt('');
      },
    }),
    [isOpen, prefilledPrompt],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatDialog(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatDialog must be used within a ChatProvider');
  }
  return ctx;
}
