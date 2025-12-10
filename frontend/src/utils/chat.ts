import { ChatSession, Message } from '../types';

export const normalizeMessage = (message: any): Message => ({
  id: message.id,
  content: message.content,
  sender: message.sender === 'user' ? 'user' : 'ai',
  timestamp: new Date(message.createdAt ?? message.timestamp ?? Date.now()),
  model: message.model ?? undefined,
  parameters: message.parameters ?? undefined,
});

export const normalizeSession = (session: any): ChatSession => ({
  id: session.id,
  title: session.title || 'New Chat',
  model: session.model,
  createdAt: new Date(session.createdAt),
  updatedAt: new Date(session.updatedAt),
  messages: (session.messages || []).map(normalizeMessage),
});
