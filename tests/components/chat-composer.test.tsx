// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatComposer } from '@/components/chat/ChatComposer';

describe('ChatComposer component', () => {
  it('renders labelled textarea with 4000 maxLength and placeholder', () => {
    render(
      <ChatComposer
        text=""
        onChange={() => {}}
        onSubmit={() => {}}
        isLoading={false}
      />,
    );

    const textarea = screen.getByLabelText('Ask a question');
    expect(textarea).toBeDefined();
    expect(textarea.getAttribute('maxLength')).toBe('4000');
    expect(textarea.getAttribute('placeholder')).toBe('Ask a question…');
  });

  it('calls onSubmit on Enter but not on Shift+Enter', () => {
    const onSubmit = vi.fn();
    render(
      <ChatComposer
        text="Tell me about ECO"
        onChange={() => {}}
        onSubmit={onSubmit}
        isLoading={false}
      />,
    );

    const textarea = screen.getByLabelText('Ask a question');

    // Shift + Enter should NOT submit
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();

    // Plain Enter SHOULD submit
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables send button when loading or empty', () => {
    const { rerender } = render(
      <ChatComposer
        text=""
        onChange={() => {}}
        onSubmit={() => {}}
        isLoading={false}
      />,
    );

    const sendBtn = screen.getByRole('button', { name: 'Send question' });
    expect(sendBtn.hasAttribute('disabled')).toBe(true);

    rerender(
      <ChatComposer
        text="Hello"
        onChange={() => {}}
        onSubmit={() => {}}
        isLoading={true}
      />,
    );
    expect(sendBtn.hasAttribute('disabled')).toBe(true);
  });
});

