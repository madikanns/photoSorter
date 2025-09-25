import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import {
  FolderOpen,
  PlayArrow,
  Stop,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

function App() {
  const [sourceFolder, setSourceFolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState({
    status: 'idle',
    progress: 0,
    message: 'Ready',
    results: null
  });
  const [error, setError] = useState('');

  // Check if running in Electron
  const isElectron = window.electronAPI !== undefined;

  const handleSelectFolder = async () => {
    if (!isElectron) {
      setError('This app must be run in Electron');
      return;
    }

    try {
      const folder = await window.electronAPI.selectFolder();
      if (folder) {
        setSourceFolder(folder);
        setError('');
      }
    } catch (err) {
      setError('Failed to select folder: ' + err.message);
    }
  };

  const handleOrganizePhotos = async () => {
    if (!sourceFolder) {
      setError('Please select a folder first');
      return;
    }

    setIsProcessing(true);
    setError('');
    setStatus({
      status: 'processing',
      progress: 0,
      message: 'Starting photo organization...',
      results: null
    });

    try {
      // Listen for real-time progress updates
      const progressHandler = (event, progressData) => {
        const progressPercent = Math.round((progressData.processed / progressData.total) * 100);
        const sourceInfo = progressData.source ? ` from ${progressData.source}` : '';
        setStatus(prev => ({
          ...prev,
          progress: progressPercent,
          message: `Processing ${progressData.current}${sourceInfo}... (${progressData.processed}/${progressData.total})`
        }));
      };

      // Add progress listener
      if (window.electronAPI && window.electronAPI.onProgress) {
        window.electronAPI.onProgress(progressHandler);
      }

      const result = await window.electronAPI.organizePhotos(sourceFolder);
      
      // Remove progress listener
      if (window.electronAPI && window.electronAPI.removeProgressListener) {
        window.electronAPI.removeProgressListener(progressHandler);
      }
      
      if (result.success) {
        setStatus({
          status: 'completed',
          progress: 100,
          message: result.message,
          results: result.results
        });
      } else {
        setError(result.message);
        setStatus({
          status: 'error',
          progress: 0,
          message: 'Organization failed',
          results: null
        });
      }
    } catch (err) {
      setError('Failed to organize photos: ' + err.message);
      setStatus({
        status: 'error',
        progress: 0,
        message: 'Organization failed',
        results: null
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = () => {
    setIsProcessing(false);
    setStatus({
      status: 'idle',
      progress: 0,
      message: 'Stopped',
      results: null
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          📸 photoSorter
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Organize your photos by year automatically
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Source Folder"
            value={sourceFolder}
            onChange={(e) => setSourceFolder(e.target.value)}
            placeholder="Select a folder containing photos..."
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button
                  variant="outlined"
                  startIcon={<FolderOpen />}
                  onClick={handleSelectFolder}
                  sx={{ ml: 1 }}
                >
                  Browse...
                </Button>
              )
            }}
          />
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleOrganizePhotos}
            disabled={!sourceFolder || isProcessing}
            sx={{ minWidth: 200 }}
          >
            Organize Photos
          </Button>
          
          {isProcessing && (
            <Button
              variant="outlined"
              size="large"
              startIcon={<Stop />}
              onClick={handleStop}
              color="error"
            >
              Stop
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {status.status !== 'idle' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status: {status.message}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={status.progress} 
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary">
              {status.progress}% Complete
            </Typography>
          </Box>
        )}

        {status.results && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CheckCircle color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Organization Results
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Total Photos:</strong> {status.results.totalPhotos}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Duplicates Found:</strong> {status.results.duplicates}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Problematic Files:</strong> {status.results.problematic}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Organized Folder:</strong> {status.results.organizedFolder || 'Organized photo'}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Organized by Year:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(status.results.organizedByYear).map(([year, count]) => (
                  <Chip
                    key={year}
                    label={`${year}: ${count} photos`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {!isElectron && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> This is the browser version. For full functionality including file system access, 
              please run the desktop version using: <code>npm run electron-dev</code>
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
}

export default App;
