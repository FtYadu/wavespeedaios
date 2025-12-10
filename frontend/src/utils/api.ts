import axios from 'axios';
import { ChatSession, AIModel } from '../types';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const withAuth = (accessToken: string) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

export interface SendMessageRequest {
  message: string;
  model: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  sessionId?: string | null;
}

export interface SendMessageResponse {
  message: string;
  session?: ChatSession;
}

export const chatApi = {
  // Send message to AI
  sendMessage: async (
    accessToken: string,
    data: SendMessageRequest,
  ): Promise<SendMessageResponse> => {
    const response = await apiClient.post('/chat/message', data, withAuth(accessToken));
    return response.data;
  },

  // Get chat sessions
  getSessions: async (accessToken: string): Promise<ChatSession[]> => {
    const response = await apiClient.get('/chat/sessions', withAuth(accessToken));
    return response.data;
  },

  // Get specific session
  getSession: async (accessToken: string, id: string): Promise<ChatSession> => {
    const response = await apiClient.get(`/chat/sessions/${id}`, withAuth(accessToken));
    return response.data;
  },

  // Delete session
  deleteSession: async (accessToken: string, id: string): Promise<void> => {
    await apiClient.delete(`/chat/sessions/${id}`, withAuth(accessToken));
  },

  // Get available models
  getModels: async (accessToken: string): Promise<AIModel[]> => {
    const response = await apiClient.get('/wavespeed/models', withAuth(accessToken));
    return response.data;
  },
};

export const authApi = {
  // Register new user
  register: async (data: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: any; access_token: string }> => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, data);
    return response.data;
  },

  // Login
  login: async (data: {
    email: string;
    password: string;
  }): Promise<{ user: any; access_token: string }> => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, data);
    return response.data;
  },

  // Update API key
  updateApiKey: async (accessToken: string, apiKey: string): Promise<void> => {
    await apiClient.post('/auth/api-key', { apiKey }, withAuth(accessToken));
  },

  // Get user profile
  getProfile: async (accessToken: string): Promise<any> => {
    const response = await apiClient.get('/auth/profile', withAuth(accessToken));
    return response.data;
  },
};

export const waveSpeedApi = {
  getPredictions: async (
    accessToken: string,
    params: {
      page?: number;
      pageSize?: number;
      model?: string;
      status?: string;
      createdAfter?: string;
      createdBefore?: string;
    } = {},
  ) => {
    const response = await apiClient.get('/wavespeed/predictions', {
      ...withAuth(accessToken),
      params: {
        page: params.page,
        pageSize: params.pageSize,
        model: params.model,
        status: params.status,
        createdAfter: params.createdAfter,
        createdBefore: params.createdBefore,
      },
    });
    return response.data;
  },

  getStreamingModels: async (accessToken: string) => {
    const response = await apiClient.get('/wavespeed/streaming/models', withAuth(accessToken));
    return response.data;
  },
};

export default apiClient;
