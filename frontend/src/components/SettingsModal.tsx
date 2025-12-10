import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import { AIModel, ModelParameters } from '../types';
import { FALLBACK_MODELS } from '../config/models';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  modelParams: ModelParameters;
  onParamsChange: (params: ModelParameters) => void;
  availableModels: AIModel[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  selectedModel,
  onModelChange,
  modelParams,
  onParamsChange,
  availableModels,
}) => {
  const models = availableModels.length ? availableModels : FALLBACK_MODELS;
  const currentModel = models.find(m => m.id === selectedModel);

  const handleParamChange = (param: keyof ModelParameters, value: number) => {
    onParamsChange({ ...modelParams, [param]: value });
  };

  const resetToDefaults = () => {
    if (currentModel) {
      onParamsChange(currentModel.defaultParameters);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>AI Model Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {/* Model Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>AI Model</InputLabel>
            <Select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              label="AI Model"
            >
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {model.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {model.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Parameters */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Model Parameters
          </Typography>

          <Grid container spacing={3}>
            {/* Temperature */}
            <Grid item xs={12}>
              <Box>
                <Typography gutterBottom>
                  Temperature: {modelParams.temperature.toFixed(2)}
                </Typography>
                <Slider
                  value={modelParams.temperature}
                  onChange={(_, value) => handleParamChange('temperature', value as number)}
                  min={0}
                  max={2}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Higher values make the output more random, lower values more deterministic
                </Typography>
              </Box>
            </Grid>

            {/* Max Tokens */}
            <Grid item xs={12}>
              <Box>
                <Typography gutterBottom>
                  Max Tokens: {modelParams.maxTokens}
                </Typography>
                <Slider
                  value={modelParams.maxTokens}
                  onChange={(_, value) => handleParamChange('maxTokens', value as number)}
                  min={100}
                  max={currentModel?.maxTokens || 4000}
                  step={100}
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Maximum number of tokens to generate
                </Typography>
              </Box>
            </Grid>

            {/* Top P */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography gutterBottom>
                  Top P: {modelParams.topP.toFixed(2)}
                </Typography>
                <Slider
                  value={modelParams.topP}
                  onChange={(_, value) => handleParamChange('topP', value as number)}
                  min={0}
                  max={1}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Nucleus sampling
                </Typography>
              </Box>
            </Grid>

            {/* Frequency Penalty */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography gutterBottom>
                  Frequency Penalty: {modelParams.frequencyPenalty.toFixed(1)}
                </Typography>
                <Slider
                  value={modelParams.frequencyPenalty}
                  onChange={(_, value) => handleParamChange('frequencyPenalty', value as number)}
                  min={-2}
                  max={2}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Penalize repetition
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button variant="outlined" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;
