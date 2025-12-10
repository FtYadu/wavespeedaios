import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Paper, IconButton, Drawer, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import { Menu as MenuIcon, Settings as SettingsIcon, BarChart } from '@mui/icons-material';
import MessageList from './MessageList';
import InputArea from './InputArea';
import SettingsModal from './SettingsModal';
import HistoryPanel from './HistoryPanel';
import PredictionDrawer from './PredictionDrawer';
import { Message, ChatSession, AIModel } from '../types';
import { chatApi } from '../utils/api';
import { normalizeSession } from '../utils/chat';
import { FALLBACK_MODELS } from '../config/models';

const ChatInterface: React.FC = () => {
  const { data: session } = useSession();
  const accessToken = session?.accessToken as string | undefined;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPredictionDrawerOpen, setIsPredictionDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const [modelParams, setModelParams] = useState({
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
  });
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!accessToken) {
      setAvailableModels([]);
      return;
    }

    const loadModels = async () => {
      try {
        const models = await chatApi.getModels(accessToken);
        setAvailableModels(models);

        if (models.length && !models.some((model) => model.id === selectedModel)) {
          setSelectedModel(models[0].id);
          setModelParams(models[0].defaultParameters);
        }
      } catch (error) {
        console.error('Failed to load models', error);
      }
    };

    loadModels();
  }, [accessToken]);

  const effectiveModels = availableModels.length ? availableModels : FALLBACK_MODELS;

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    const nextModel = effectiveModels.find((model) => model.id === modelId);
    if (nextModel) {
      setModelParams(nextModel.defaultParameters);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !accessToken) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(
        accessToken,
        {
          message: content,
          model: selectedModel,
          parameters: modelParams,
          sessionId: currentSession?.id,
        },
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'ai',
        timestamp: new Date(),
        model: selectedModel,
        parameters: modelParams,
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response.session) {
        const normalizedSession = normalizeSession(response.session);
        setCurrentSession(normalizedSession);
        setMessages(normalizedSession.messages);
        setSelectedModel(normalizedSession.model);
        setHistoryRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
    setSelectedModel(session.model);
    setIsHistoryOpen(false);
  };

  const handleNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
    const defaultModel = effectiveModels[0];
    setSelectedModel(defaultModel.id);
    setModelParams(defaultModel.defaultParameters);
    setIsHistoryOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile Drawer */}
      {isMobile && (
        <>
          <Drawer
            anchor="left"
            open={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            sx={{ '& .MuiDrawer-paper': { width: '280px' } }}
          >
            <HistoryPanel
              onSessionSelect={handleSessionSelect}
              onNewChat={handleNewChat}
              currentSessionId={currentSession?.id}
              accessToken={accessToken}
              refreshKey={historyRefreshKey}
            />
          </Drawer>
        </>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box sx={{ width: 280, bgcolor: 'white', borderRight: 1, borderColor: 'divider' }}>
          <HistoryPanel
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
            currentSessionId={currentSession?.id}
            accessToken={accessToken}
            refreshKey={historyRefreshKey}
          />
        </Box>
      )}

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setIsHistoryOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Box>
              <Box sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                AI Chat Assistant
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                {selectedModel}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Prediction history">
              <span>
                <IconButton
                  onClick={() => setIsPredictionDrawerOpen(true)}
                  disabled={!accessToken}
                >
                  <BarChart />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Model settings">
              <IconButton onClick={() => setIsSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <MessageList messages={messages} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
          <InputArea
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!session || !accessToken}
          />
        </Box>
      </Box>

      {/* Drawers & Modals */}
      <PredictionDrawer
        open={isPredictionDrawerOpen}
        onClose={() => setIsPredictionDrawerOpen(false)}
        accessToken={accessToken}
      />
      <SettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        modelParams={modelParams}
        onParamsChange={setModelParams}
        availableModels={availableModels}
      />
    </Box>
  );
};

export default ChatInterface;
