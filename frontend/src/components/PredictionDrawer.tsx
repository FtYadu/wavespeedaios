import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
  Stack,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Close, Refresh } from '@mui/icons-material';
import { waveSpeedApi } from '../utils/api';

interface PredictionDrawerProps {
  open: boolean;
  onClose: () => void;
  accessToken?: string;
}

type PredictionStatus = 'completed' | 'failed' | 'processing';

const statusColorMap: Record<PredictionStatus, 'success' | 'error' | 'warning'> = {
  completed: 'success',
  failed: 'error',
  processing: 'warning',
};

const PredictionDrawer: React.FC<PredictionDrawerProps> = ({ open, onClose, accessToken }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PredictionStatus>('all');
  const [streamingModels, setStreamingModels] = useState<string[]>([]);
  const [loadingStreaming, setLoadingStreaming] = useState(false);

  const loadPredictions = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setError('');
      const data = await waveSpeedApi.getPredictions(accessToken, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: 1,
        pageSize: 20,
      });
      setPredictions(data?.data?.items || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadPredictions();
      loadStreamingModels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, statusFilter]);

  const loadStreamingModels = async () => {
    if (!accessToken) return;
    try {
      setLoadingStreaming(true);
      const models = await waveSpeedApi.getStreamingModels(accessToken);
      setStreamingModels(models || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStreaming(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: 360 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6">Prediction History</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1">Streaming Models</Typography>
          <Tooltip title="Fetched from /wavespeed/streaming/models">
            <span>
              <IconButton size="small" onClick={loadStreamingModels} disabled={loadingStreaming}>
                <Refresh fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        {loadingStreaming ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Loading streaming data...
            </Typography>
          </Stack>
        ) : streamingModels.length ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {streamingModels.map((model) => (
              <Chip key={model} label={model} size="small" />
            ))}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            No streaming endpoints available yet.
          </Typography>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {(['all', 'processing', 'completed', 'failed'] as const).map((status) => (
          <Chip
            key={status}
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            variant={statusFilter === status ? 'filled' : 'outlined'}
            color={status === 'all' ? 'default' : statusColorMap[status as PredictionStatus]}
            onClick={() => setStatusFilter(status)}
          />
        ))}
        <Button
          size="small"
          startIcon={<Refresh />}
          onClick={loadPredictions}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Stack alignItems="center" spacing={2} sx={{ mt: 4 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Loading predictions...
            </Typography>
          </Stack>
        ) : error ? (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        ) : predictions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No predictions found for the selected filter.
          </Typography>
        ) : (
          <List>
            {predictions.map((prediction: any) => (
              <React.Fragment key={prediction.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" noWrap>
                          {prediction.model}
                        </Typography>
                        <Chip
                          label={prediction.status}
                          size="small"
                          color={statusColorMap[prediction.status as PredictionStatus] || 'default'}
                        />
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatDate(prediction.created_at)}
                        </Typography>
                        {prediction.outputs?.length ? (
                          <Typography variant="caption" color="primary.main" display="block" noWrap>
                            {prediction.outputs[0]}
                          </Typography>
                        ) : null}
                        {prediction.error && (
                          <Typography variant="caption" color="error" display="block">
                            {prediction.error}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default PredictionDrawer;
