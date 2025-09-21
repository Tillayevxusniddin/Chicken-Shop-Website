import React from 'react';
import { Box, Container, Typography } from '@mui/material';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  gradient?: boolean;
  maxWidth?: 'lg' | 'md' | 'sm' | 'xl' | 'xs' | false;
  id?: string;
  padTop?: number;
  padBottom?: number;
}

const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  gradient = false,
  maxWidth = 'lg',
  id,
  padTop = 8,
  padBottom = 10
}) => {
  return (
    <Box
      component="section"
      id={id}
      sx={(theme) => ({
        position: 'relative',
        py: { xs: padTop * 0.6, md: padTop },
        pb: { xs: padBottom * 0.6, md: padBottom },
        background: gradient ? theme.palette.gradient.subtle : 'transparent',
        overflow: 'hidden'
      })}
    >
      <Container maxWidth={maxWidth}>
        {(title || subtitle) && (
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            {title && (
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 760, mx: 'auto' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        {children}
      </Container>
    </Box>
  );
};

export default Section;
