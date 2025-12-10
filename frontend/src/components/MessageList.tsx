import React, { useState } from 'react';
import { Box, Typography, Avatar, Paper, CircularProgress, IconButton, Tooltip, Chip } from '@mui/material';
import { Person, SmartToy, ContentCopy } from '@mui/icons-material';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message', error);
    }
  };

  if (messages.length === 0) {
    return (
      <Box
        sx={
          {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }
        }
      >
        <Typography variant="h6" color="text.secondary" align="center">
          Start a conversation with the AI assistant
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, pb: 4 }}>
      {messages.map((message, index) => (
        <Box
          key={message.id}
          sx={
            {
              display: 'flex',
              mb: 2,
              gap: 2,
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
            }
          }
        >
          <Avatar sx={{ bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main' }}>
            {message.sender === 'user' ? <Person /> : <SmartToy />}
          </Avatar>
          
          <Paper
            elevation={0}
            sx={
              {
                p: 2,
                maxWidth: '70%',
                bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                color: message.sender === 'user' ? 'white' : 'text.primary',
                border: 1,
                borderColor: 'divider',
              }
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>
                {message.content}
              </Typography>
              {message.sender === 'ai' && (
                <Tooltip title="Copy response">
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(message.id, message.content)}
                  >
                    <ContentCopy fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Typography
              variant="caption"
              sx={
                {
                  display: 'block',
                  mt: 1,
                  opacity: 0.7,
                  color: message.sender === 'user' ? 'inherit' : 'text.secondary',
                }
              }
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>
            {copiedId === message.id && (
              <Chip label="Copied" size="small" color="success" sx={{ mt: 1 }} />
            )}
          </Paper>
        </Box>
      ))}
      
      {isLoading && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <SmartToy />
          </Avatar>
          <Paper
            elevation={0}
            sx={
              {
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: 1,
                borderColor: 'divider',
              }
            }
          >
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              AI is thinking...
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default MessageList;
