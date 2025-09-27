import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Link,
} from '@mui/material';
import {
  SentimentSatisfiedAlt,
  SentimentNeutral,
  SentimentDissatisfied,
} from '@mui/icons-material';

interface NewsCardProps {
  article: {
    title: string;
    source: string;
    published_at: string;
    sentiment: number; // -1 to 1
    url?: string;
  };
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.2) return <SentimentSatisfiedAlt />;
    if (sentiment < -0.2) return <SentimentDissatisfied />;
    return <SentimentNeutral />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'success';
    if (sentiment < -0.2) return 'error';
    return 'warning';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.2) return 'Positive';
    if (sentiment < -0.2) return 'Negative';
    return 'Neutral';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {article.url ? (
              <Link 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
              >
                {article.title}
              </Link>
            ) : (
              article.title
            )}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {article.source}
          </Typography>
          <Chip
            icon={getSentimentIcon(article.sentiment)}
            label={getSentimentLabel(article.sentiment)}
            color={getSentimentColor(article.sentiment) as any}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          {formatDate(article.published_at)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
