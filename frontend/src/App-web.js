import React, { useState } from 'react';
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
  CardActions
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

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState({
    status: 'idle',
    progress: 0,
    message: 'Ready',
    results: null
  });
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const photoFiles = files.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(extension);
    });
    
    setSelectedFiles(photoFiles);
    setError('');
  };

  const getPhotoDate = (file) => {
    return new Promise((resolve) => {
      // Try to get date from EXIF data
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const dataView = new DataView(arrayBuffer);
          
          // Look for EXIF data
          if (dataView.getUint16(0) === 0xFFD8) { // JPEG marker
            let offset = 2;
            while (offset < dataView.byteLength) {
              const marker = dataView.getUint16(offset);
              if (marker === 0xFFE1) { // EXIF marker
                const exifLength = dataView.getUint16(offset + 2);
                const exifData = new DataView(arrayBuffer, offset + 4, exifLength - 2);
                
                // Look for DateTime tag (0x0132)
                if (exifData.getUint16(0) === 0x4949) { // Little endian
                  const ifdOffset = exifData.getUint32(4);
                  const numEntries = exifData.getUint16(ifdOffset);
                  
                  for (let i = 0; i < numEntries; i++) {
                    const entryOffset = ifdOffset + 2 + (i * 12);
                    const tag = exifData.getUint16(entryOffset);
                    
                    if (tag === 0x0132) { // DateTime tag
                      const valueOffset = exifData.getUint32(entryOffset + 8);
                      const dateString = new TextDecoder().decode(
                        new Uint8Array(arrayBuffer, offset + 4 + valueOffset, 19)
                      );
                      const date = new Date(dateString);
                      if (!isNaN(date.getTime())) {
                        resolve(date.getFullYear().toString());
                        return;
                      }
                    }
                  }
                }
                break;
              }
              offset += 2 + dataView.getUint16(offset + 2);
            }
          }
        } catch (err) {
          console.log('Error reading EXIF data:', err);
        }
        
        // Fallback to file modification date
        const date = new Date(file.lastModified);
        resolve(date.getFullYear().toString());
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const organizePhotos = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select some photo files first');
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
      const organizedByYear = {};
      const processedFiles = [];
      let processedCount = 0;

      for (const file of selectedFiles) {
        try {
          const year = await getPhotoDate(file);
          
          if (!organizedByYear[year]) {
            organizedByYear[year] = [];
          }
          organizedByYear[year].push(file.name);
          processedFiles.push({
            name: file.name,
            year: year,
            size: file.size
          });
          
          processedCount++;
          const progressPercent = Math.round((processedCount / selectedFiles.length) * 100);
          
          setStatus(prev => ({
            ...prev,
            progress: progressPercent,
            message: `Processing ${file.name}... (${processedCount}/${selectedFiles.length})`
          }));

        } catch (err) {
          console.error(`Error processing ${file.name}:`, err);
        }
      }

      const result = {
        success: true,
        message: `Successfully organized ${processedCount} photos by year!`,
        results: {
          totalPhotos: selectedFiles.length,
          organizedByYear,
          processed: processedCount,
          processedFiles: processedFiles
        }
      };

      setStatus({
        status: 'completed',
        progress: 100,
        message: result.message,
        results: result.results
      });

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

  const downloadResults = () => {
    if (!status.results) return;

    const results = {
      summary: {
        totalPhotos: status.results.totalPhotos,
        organizedByYear: status.results.organizedByYear,
        processed: status.results.processed
      },
      files: status.results.processedFiles
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photo-organization-results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            Running on: <strong>Web Browser</strong> • File API access available
          </Typography>
        </Box>

        {/* File Selection */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Select Photo Files"
            value={selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'No files selected'}
            placeholder="Select photo files to organize..."
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button
                  variant="outlined"
                  startIcon={<FolderOpen />}
                  component="label"
                  sx={{ ml: 1 }}
                >
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={handleFileSelect}
                  />
                </Button>
              )
            }}
          />
          {selectedFiles.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selected files: {selectedFiles.map(f => f.name).join(', ')}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={organizePhotos}
            disabled={selectedFiles.length === 0 || isProcessing}
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
              sx={{ minWidth: 200 }}
            >
              Stop
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <ErrorIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            {error}
          </Alert>
        )}

        {status.status === 'processing' && (
          <Box sx={{ width: '100%', mt: 3 }}>
            <LinearProgress variant="determinate" value={status.progress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {status.message}
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
                    <strong>Processed:</strong> {status.results.processed}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Organized by Year:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(status.results.organizedByYear).map(([year, files]) => (
                  <Chip
                    key={year}
                    label={`${year}: ${files.length} photos`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button onClick={downloadResults} variant="outlined">
                Download Results
              </Button>
            </CardActions>
          </Card>
        )}
      </Paper>
    </Container>
  );
}

export default App;
