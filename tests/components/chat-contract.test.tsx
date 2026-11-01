// @vitest-environment jsdom
import { act, render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AssistantRuntimeProvider,
  type AssistantRuntime,
} from '@assistant-ui/react';
import { useChatRuntime, useAISDKChat } from '@assistant-ui/react-ai-sdk';
import type { UIMessage } from 'ai';
import { createChatTransport } from '@/components/chat/transport';
import { CHAT_LIMITS } from '@/components/chat/limits';
import { projectRequest } from '@/components/chat/request-projection';
import { chatRequestSchema } from '../../src/server/chat/validation';
import { POST } from '../../src/app/api/chat/route';

describe('Real assistant-ui runtime to frozen backend contract (OFFLINE MOCK)', () => {
  it('sends accepted first and follow-up bodies with actual SDK source/step/tool history', async () => {
    const bodies: unknown[] = [];
    let runtime: AssistantRuntime | undefined;
    let messages: UIMessage[] = [];
    const transport = createChatTransport(async (_url, init) => {
      const body: unknown = JSON.parse(String(init?.body));
      bodies.push(body);
      expect(chatRequestSchema.safeParse(body).success).toBe(true);
      return POST(
        new Request('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      );
    });
    function Probe() {
      messages = useAISDKChat()?.messages ?? [];
      return null;
    }
    function App() {
      runtime = useChatRuntime({ transport });
      return (
        <AssistantRuntimeProvider runtime={runtime}>
          <Probe />
        </AssistantRuntimeProvider>
      );
    }
    render(<App />);
    act(() => runtime!.thread.append('Send me the brochure and a video.'));
    await waitFor(() => expect(messages.at(-1)?.role).toBe('assistant'));
    await waitFor(() =>
      expect(runtime!.thread.getState().isRunning).toBe(false),
    );
    const assistant = messages.at(-1)!;
    expect(assistant.parts.map((part) => part.type)).toEqual(
      expect.arrayContaining([
        'step-start',
        'source-url',
        'tool-sendBrochure',
        'tool-showVideo',
      ]),
    );
    act(() => runtime!.thread.append('How much is ECO?'));
    await waitFor(() => expect(bodies).toHaveLength(2));
    const second = chatRequestSchema.parse(bodies[1]);
    expect(second.messages[1]?.parts.map((part) => part.type)).toEqual(
      expect.arrayContaining([
        'step-start',
        'source-url',
        'tool-sendBrochure',
        'tool-showVideo',
      ]),
    );
    expect(second.messages.at(-1)?.parts).toEqual([
      { type: 'text', text: 'How much is ECO?' },
    ]);
    await waitFor(() =>
      expect(runtime!.thread.getState().isRunning).toBe(false),
    );
  });
  it('bounds worst-case parts/text without dropping conversational turns', () => {
    const messages: UIMessage[] = [
      {
        id: 'a',
        role: 'assistant',
        parts: Array.from({ length: 20 }, () => ({
          type: 'text',
          text: 'x'.repeat(1000),
        })),
      },
      { id: 'u', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
    ];
    const body = projectRequest(messages);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0]?.parts).toEqual([
      {
        type: 'text',
        text:
          'x'.repeat(1000) +
          '\n' +
          'x'.repeat(1000) +
          '\n' +
          'x'.repeat(1000) +
          '\n' +
          'x'.repeat(997),
      },
    ]);
    expect(chatRequestSchema.safeParse(body).success).toBe(true);
  });
  it('matches the exported backend schema boundaries (no numeric backend constants exist)', () => {
    const user = (text = 'x') => ({
      id: 'u',
      role: 'user',
      parts: [{ type: 'text', text }],
    });
    expect(
      chatRequestSchema.safeParse({
        messages: Array.from({ length: CHAT_LIMITS.messages }, () => user()),
      }).success,
    ).toBe(true);
    expect(
      chatRequestSchema.safeParse({
        messages: Array.from({ length: CHAT_LIMITS.messages + 1 }, () =>
          user(),
        ),
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        messages: [user('x'.repeat(CHAT_LIMITS.text))],
      }).success,
    ).toBe(true);
    expect(
      chatRequestSchema.safeParse({
        messages: [user('x'.repeat(CHAT_LIMITS.text + 1))],
      }).success,
    ).toBe(false);
    for (const count of [CHAT_LIMITS.parts, CHAT_LIMITS.parts + 1])
      expect(
        chatRequestSchema.safeParse({
          messages: [
            {
              ...user(),
              parts: Array.from({ length: count }, () => ({
                type: 'text',
                text: 'x',
              })),
            },
          ],
        }).success,
      ).toBe(count === CHAT_LIMITS.parts);
  });
});
