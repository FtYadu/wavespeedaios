import { normalizeMessage, normalizeSession } from './chat';

describe('chat utils', () => {
  it('normalizes a message timestamp', () => {
    const message = normalizeMessage({
      id: '1',
      content: 'Hello',
      sender: 'ai',
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    expect(message.id).toBe('1');
    expect(message.sender).toBe('ai');
    expect(message.timestamp).toBeInstanceOf(Date);
  });

  it('normalizes session objects', () => {
    const session = normalizeSession({
      id: 'session-1',
      title: 'Test',
      model: 'gpt-4',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:10:00.000Z',
      messages: [
        { id: '1', content: 'Hi', sender: 'user', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', content: 'Hello', sender: 'ai', createdAt: '2024-01-01T00:00:10.000Z' },
      ],
    });

    expect(session.title).toBe('Test');
    expect(session.messages).toHaveLength(2);
    expect(session.messages[0].timestamp).toBeInstanceOf(Date);
  });
});
