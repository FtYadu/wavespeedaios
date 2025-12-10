import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add, Chat, Delete } from '@mui/icons-material';
import { ChatSession } from '../types';
import { chatApi } from '../utils/api';
import { normalizeSession } from '../utils/chat';

interface HistoryPanelProps {
  onSessionSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  currentSessionId?: string | null;
  accessToken?: string;
  refreshKey?: number;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  onSessionSelect,
  onNewChat,
  currentSessionId,
  accessToken,
  refreshKey,
}) => {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      setSessions([]);
      return;
    }
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, refreshKey]);

  const loadSessions = async () => {
    if (!accessToken) {
      return;
    }

    try {
      setLoading(true);
      const data = await chatApi.getSessions(accessToken);
      setSessions(data.map(normalizeSession));
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!accessToken) {
      return;
    }

    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await chatApi.deleteSession(accessToken, sessionId);
        setSessions(sessions.filter(s => s.id !== sessionId));
        
        if (currentSessionId === sessionId) {
          onNewChat();
        }
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const filteredSessions = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return sessions;
    }
    const term = searchTerm.toLowerCase();
    return sessions.filter((session) =>
      (session.title || 'New Chat').toLowerCase().includes(term),
    );
  }, [sessions, searchTerm]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Chat History
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="Search conversations"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">🔍</InputAdornment>,
          }}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Add />}
          onClick={onNewChat}
        >
          New Chat
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : filteredSessions.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No chat history
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredSessions.map((session) => (
              <ListItem
                key={session.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={currentSessionId === session.id}
                  onClick={() => onSessionSelect(session)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chat fontSize="small" />
                        <Typography variant="body2" noWrap>
                          {session.title || 'New Chat'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(session.updatedAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {session.messages.length} messages
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default HistoryPanel;
