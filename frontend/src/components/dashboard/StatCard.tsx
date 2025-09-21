import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface StatCardProps {
  label: string;
  value: number | string;
  delta?: number; // percent change
  icon?: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, loading }) => {
  const isPositive = (delta ?? 0) >= 0;
  return (
    <Card
      sx={(theme) => ({
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(140deg,rgba(255,193,7,.12),rgba(255,111,0,.06))'
          : 'linear-gradient(140deg,#ffffff,#fff8e2)',
        borderRadius: 20,
        minHeight: 140,
        display: 'flex'
      })}
    >
      <CardContent sx={{ width: '100%' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Box sx={{
            width: 52,
            height: 52,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: (theme) => theme.palette.gradient.primary,
            color: 'primary.contrastText',
            fontSize: 26,
            boxShadow: (theme) => `0 4px 14px -2px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,.6)' : 'rgba(0,0,0,.18)'}`
          }}>
            {icon || '🐔'}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500, letterSpacing: '.5px' }}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={80} height={44} sx={{ fontSize: 0 }} />
            ) : (
              <Typography component={motion.div} variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {value}
              </Typography>
            )}
            {!loading && delta !== undefined && (
              <Stack component={motion.div} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} direction="row" alignItems="center" spacing={0.5} mt={1}>
                {isPositive ? <ArrowUpwardIcon color="success" fontSize="inherit" /> : <ArrowDownwardIcon color="error" fontSize="inherit" />}
                <Typography variant="caption" color={isPositive ? 'success.main' : 'error.main'} fontWeight={600}>
                  {isPositive ? '+' : ''}{delta}%
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
