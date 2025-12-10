import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessages(
    userId: string,
    sessionId: string | null | undefined,
    userMessage: string,
    aiMessage: string,
    model: string,
    parameters?: any,
  ) {
    let session;

    if (sessionId) {
      // Update existing session
      session = await this.prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        include: { messages: true },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }
    } else {
      // Create new session
      const title = userMessage.length > 50 
        ? `${userMessage.substring(0, 50)}...`
        : userMessage;

      session = await this.prisma.chatSession.create({
        data: {
          title,
          userId,
          model,
        },
        include: { messages: true },
      });
    }

    // Save user message
    await this.prisma.message.create({
      data: {
        content: userMessage,
        sender: 'user',
        sessionId: session.id,
      },
    });

    // Save AI message
    await this.prisma.message.create({
      data: {
        content: aiMessage,
        sender: 'ai',
        sessionId: session.id,
        model,
        parameters: parameters || null,
      },
    });

    // Update session timestamp
    await this.prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    // Return updated session with messages
    return this.prisma.chatSession.findUnique({
      where: { id: session.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getUserSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.chatSession.delete({
      where: { id: sessionId },
    });
  }
}