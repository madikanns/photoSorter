import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
} from '@mui/material';
import {
  Notifications,
  Security,
  Palette,
  Language,
  Storage,
  Speed,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      priceAlerts: true,
      sentimentAlerts: true,
      predictionUpdates: false,
      emailNotifications: true,
    },
    display: {
      darkMode: false,
      compactView: false,
      showCharts: true,
      autoRefresh: true,
    },
    api: {
      refreshInterval: 30,
      maxRequests: 100,
      cacheEnabled: true,
    },
    privacy: {
      dataCollection: true,
      analytics: true,
      crashReporting: true,
    },
  });

  const handleSettingChange = (category: string, setting: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend/localStorage
    console.log('Saving settings:', settings);
    // Show success message
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your StockPrediction experience
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Price Alerts"
                    secondary="Get notified when stocks reach target prices"
                  />
                  <Switch
                    checked={settings.notifications.priceAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'priceAlerts', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Sentiment Alerts"
                    secondary="Notifications for significant sentiment changes"
                  />
                  <Switch
                    checked={settings.notifications.sentimentAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'sentimentAlerts', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Prediction Updates"
                    secondary="New ML predictions and model updates"
                  />
                  <Switch
                    checked={settings.notifications.predictionUpdates}
                    onChange={(e) => handleSettingChange('notifications', 'predictionUpdates', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive updates via email"
                  />
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Display Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette sx={{ mr: 1 }} />
                <Typography variant="h6">Display</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Dark Mode"
                    secondary="Switch to dark theme"
                  />
                  <Switch
                    checked={settings.display.darkMode}
                    onChange={(e) => handleSettingChange('display', 'darkMode', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Compact View"
                    secondary="Reduce spacing for more content"
                  />
                  <Switch
                    checked={settings.display.compactView}
                    onChange={(e) => handleSettingChange('display', 'compactView', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Show Charts"
                    secondary="Display interactive charts"
                  />
                  <Switch
                    checked={settings.display.showCharts}
                    onChange={(e) => handleSettingChange('display', 'showCharts', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Auto Refresh"
                    secondary="Automatically refresh data"
                  />
                  <Switch
                    checked={settings.display.autoRefresh}
                    onChange={(e) => handleSettingChange('display', 'autoRefresh', e.target.checked)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* API Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed sx={{ mr: 1 }} />
                <Typography variant="h6">API Settings</Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Refresh Interval (seconds)"
                type="number"
                value={settings.api.refreshInterval}
                onChange={(e) => handleSettingChange('api', 'refreshInterval', Number(e.target.value))}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Max Requests per Hour"
                type="number"
                value={settings.api.maxRequests}
                onChange={(e) => handleSettingChange('api', 'maxRequests', Number(e.target.value))}
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.api.cacheEnabled}
                    onChange={(e) => handleSettingChange('api', 'cacheEnabled', e.target.checked)}
                  />
                }
                label="Enable Caching"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1 }} />
                <Typography variant="h6">Privacy</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Data Collection"
                    secondary="Help improve the app by sharing usage data"
                  />
                  <Switch
                    checked={settings.privacy.dataCollection}
                    onChange={(e) => handleSettingChange('privacy', 'dataCollection', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Analytics"
                    secondary="Track app performance and usage"
                  />
                  <Switch
                    checked={settings.privacy.analytics}
                    onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Crash Reporting"
                    secondary="Automatically report crashes for debugging"
                  />
                  <Switch
                    checked={settings.privacy.crashReporting}
                    onChange={(e) => handleSettingChange('privacy', 'crashReporting', e.target.checked)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ mr: 1 }} />
                <Typography variant="h6">System Information</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary">
                      v1.0.0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      App Version
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary">
                      2.4 GB
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cache Size
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary">
                      1,247
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      API Calls Today
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary">
                      99.9%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uptime
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          sx={{ minWidth: 120 }}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
