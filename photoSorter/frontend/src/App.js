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
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  FolderOpen,
  PlayArrow,
  Stop,
  CheckCircle,
  Error as ErrorIcon,
  CloudUpload,
  Computer
} from '@mui/icons-material';
import photoService from './services/photoService';
import { getPlatformCapabilities } from './utils/platform';

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
  const [activeTab, setActiveTab] = useState(0);
  const [folderType, setFolderType] = useState('local'); // 'local' or 'cloud'

  // Get platform capabilities
  const capabilities = getPlatformCapabilities();

  // Set default tab based on platform
  useEffect(() => {
    if (capabilities.platform === 'web') {
      setActiveTab(1); // Cloud storage tab for web
    }
  }, [capabilities.platform]);

  const handleSelectFolder = async () => {
    try {
      const folder = await photoService.selectFolder();
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
      setError('Please select or enter a folder path first');
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
      const progressHandler = (progressData) => {
        const progressPercent = Math.round((progressData.processed / progressData.total) * 100);
        const sourceInfo = progressData.source ? ` from ${progressData.source}` : '';
        setStatus(prev => ({
          ...prev,
          progress: progressPercent,
          message: `Processing ${progressData.current}${sourceInfo}... (${progressData.processed}/${progressData.total})`
        }));
      };

      const folderPath = capabilities.platform === 'electron' ? sourceFolder : 'root';
      const result = await photoService.organizePhotos(folderPath, progressHandler);

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

        {/* Platform Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Running on: <strong>{capabilities.platform}</strong> platform
            {capabilities.canAccessLocalFiles && ' • Local file access available'}
            {capabilities.canAccessCloudFiles && ' • Cloud storage access available'}
          </Typography>
        </Box>

        {/* Platform Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
            {capabilities.canAccessLocalFiles && (
              <Tab 
                icon={<Computer />} 
                label="Local Files" 
                iconPosition="start"
              />
            )}
            <Tab 
              icon={<CloudUpload />} 
              label="Cloud Storage" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Local Files Tab */}
        {activeTab === 0 && capabilities.canAccessLocalFiles && (
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
        )}

        {/* Local Files Tab - Browser Version */}
        {activeTab === 0 && !capabilities.canAccessLocalFiles && (
          <Box sx={{ mb: 3, textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Local File Access Not Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Local file system access is only available in the desktop version.
              <br />
              Use the Google Drive tab to organize cloud photos.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setActiveTab(1)}
              startIcon={<CloudUpload />}
            >
              Switch to Google Drive
            </Button>
          </Box>
        )}

        {/* Cloud Storage Tab */}
        {activeTab === 1 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Cloud Storage
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter a cloud storage folder URL to organize photos
              </Typography>
              <Typography variant="body2" color="info.main" sx={{ mb: 3 }}>
                Supported: Google Drive, Dropbox, OneDrive, iCloud, and more
              </Typography>
              <TextField
                fullWidth
                label="Cloud Storage Folder URL"
                value={sourceFolder}
                onChange={(e) => setSourceFolder(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/... or https://www.dropbox.com/sh/..."
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<FolderOpen />}
                onClick={handleSelectFolder}
                sx={{ mr: 2 }}
              >
                Browse Folder
              </Button>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setFolderType('cloud')}
              >
                Use Cloud Storage
              </Button>
            </Box>
          </Box>
        )}

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
