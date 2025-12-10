import React, { useState, KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Paper } from '@mui/material';
import { Send } from '@mui/icons-material';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const CHARACTER_LIMIT = 2000;

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 1, border: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="standard"
          placeholder={disabled ? 'Please sign in to chat' : 'Type your message...'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading || disabled}
          InputProps={{
            disableUnderline: true,
            sx: {
              px: 1,
              py: 0.5,
            },
          }}
          inputProps={{ maxLength: CHARACTER_LIMIT }}
          sx={{
            flex: 1,
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          color="primary"
          size="small"
        >
          <Send />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          Press Enter to send, Shift + Enter for new line
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: message.length >= CHARACTER_LIMIT ? 'error.main' : 'text.secondary' }}>
          {message.length}/{CHARACTER_LIMIT}
        </Box>
      </Box>
    </Paper>
  );
};

export default InputArea;
