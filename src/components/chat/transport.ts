import { DefaultChatTransport } from 'ai';
import { projectRequest } from './request-projection';

/** The installed adapter uses the existing AI SDK protocol, with only supported history on the wire. */
export function createChatTransport(fetcher?: typeof fetch) {
  return new DefaultChatTransport({
    api: '/api/chat',
    fetch: fetcher,
    prepareSendMessagesRequest: ({ messages }) => ({
      body: projectRequest(messages),
    }),
  });
}
