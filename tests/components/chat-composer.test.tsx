// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { createChatTransport } from '@/components/chat/transport';
import { CHAT_COPY, CHAT_UI } from '@/content';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { ChatProvider } from '@/components/ChatContext';
import { CHAT_LIMITS } from '@/components/chat/limits';
import { POST } from '../../src/app/api/chat/route';
import type { UIMessage } from 'ai';
import { chatRequestSchema } from '../../src/server/chat/validation';

describe('Runtime composer', () => {
  it('uses the shared limit and keeps whitespace-only drafts unsendable', () => {
    render(
      <ChatProvider>
        <ChatComposer />
      </ChatProvider>,
    );
    const input = screen.getByLabelText(CHAT_COPY.question);
    expect(input.getAttribute('maxlength')).toBe(String(CHAT_LIMITS.text));
    fireEvent.change(input, { target: { value: '   ' } });
    expect(
      screen
        .getByRole('button', { name: CHAT_UI.sendButton })
        .hasAttribute('disabled'),
    ).toBe(true);
  });
  it('uses real composer keyboard semantics: Shift+Enter/IME do not send, Enter sends trimmed text', async () => {
    const fetcher = vi.fn<typeof fetch>(async (_url, init) =>
      POST(
        new Request('http://localhost/api/chat', {
          method: 'POST',
          body: String(init?.body),
        }),
      ),
    );
    const transport = createChatTransport(fetcher);
    function App() {
      const runtime = useChatRuntime({ transport });
      return (
        <AssistantRuntimeProvider runtime={runtime}>
          <ChatComposer />
        </AssistantRuntimeProvider>
      );
    }
    const view = render(<App />);
    const input = screen.getByLabelText(CHAT_COPY.question);
    fireEvent.change(input, { target: { value: '  How much is VIP?  ' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true, keyCode: 229 });
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
    const body = chatRequestSchema.parse(
      JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body)),
    );
    expect(body.messages[0]?.parts).toEqual([
      { type: 'text', text: 'How much is VIP?' },
    ]);
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: CHAT_UI.sendButton })
          .hasAttribute('disabled'),
      ).toBe(true),
    );
    view.unmount();
  });
  it('disables a full conversation and offers a new one', () => {
    const messages: UIMessage[] = Array.from(
      { length: CHAT_LIMITS.messages },
      (_, i) => ({
        id: String(i),
        role: i % 2 ? 'assistant' : 'user',
        parts: [{ type: 'text', text: 'Message' }],
      }),
    );
    function App() {
      const runtime = useChatRuntime({
        messages,
        transport: createChatTransport(),
      });
      return (
        <AssistantRuntimeProvider runtime={runtime}>
          <ChatComposer />
        </AssistantRuntimeProvider>
      );
    }
    render(<App />);
    expect(
      screen.getByLabelText(CHAT_COPY.question).hasAttribute('disabled'),
    ).toBe(true);
    expect(screen.getByRole('status').textContent).toBe(CHAT_COPY.limit);
  });
});
