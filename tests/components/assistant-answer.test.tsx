// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AssistantAnswer } from '@/components/chat/AssistantAnswer';
import { CHAT_COPY } from '@/content';

describe('presentation-only long answer disclosure', () => {
  it('keeps short text unchanged without a disclosure', () => {
    const text = 'x'.repeat(600);
    const { container } = render(
      <AssistantAnswer text={text}>
        <span>{text}</span>
      </AssistantAnswer>,
    );
    expect(container.querySelector('[data-answer-text]')?.textContent).toBe(
      text,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('keeps the full original DOM text when collapsed, expanded and collapsed again', async () => {
    const text =
      '[MOCK] <script>Literal text</script>\n' +
      'Original response. '.repeat(80);
    const { container } = render(
      <AssistantAnswer text={text}>
        <span>{text}</span>
      </AssistantAnswer>,
    );
    const body = container.querySelector('[data-answer-text]')!;
    const button = screen.getByRole('button', {
      name: CHAT_COPY.showFull,
    });
    expect(body.textContent).toBe(text);
    expect(body.querySelector('script')).toBeNull();
    expect(button.getAttribute('aria-controls')).toBe(body.id);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(body.className).toContain('clamped');
    await userEvent.click(button);
    expect(
      screen
        .getByRole('button', { name: CHAT_COPY.showLess })
        .getAttribute('aria-expanded'),
    ).toBe('true');
    expect(body.className).not.toContain('clamped');
    expect(body.textContent).toBe(text);
    await userEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(body.textContent).toBe(text);
  });
});
