'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { createChatTransport } from './chat/transport';

interface ChatContextValue {
  isOpen: boolean;
  openChat: (prompt?: string) => void;
  closeChat: () => void;
  newConversation: () => Promise<void>;
}
const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const transport = useMemo(() => createChatTransport(), []);
  const runtime = useChatRuntime({ transport });
  const [isOpen, setIsOpen] = useState(false);
  const value: ChatContextValue = {
    isOpen,
    openChat: (prompt) => {
      if (prompt !== undefined) runtime.thread.composer.setText(prompt);
      setIsOpen(true);
    },
    closeChat: () => setIsOpen(false),
    newConversation: async () => {
      runtime.thread.cancelRun();
      await runtime.threads.switchToNewThread();
    },
  };
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    </AssistantRuntimeProvider>
  );
}
export function useChatDialog(): ChatContextValue {
  const value = useContext(ChatContext);
  if (!value) throw new Error('ChatProvider is required');
  return value;
}
