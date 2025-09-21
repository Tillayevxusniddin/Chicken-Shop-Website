import React from 'react';
import { Card, Box, Skeleton, Stack } from '@mui/material';

const ProductCardSkeleton: React.FC = () => {
  return (
    <Card sx={{ height: '100%', display:'flex', flexDirection:'column', p: 0 }}>
      <Box sx={{ position:'relative', pt: '60%', overflow:'hidden' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ position:'absolute', inset:0 }} />
      </Box>
      <Stack spacing={1} sx={{ p: 2 }}>
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1, mt: 1 }} />
      </Stack>
    </Card>
  );
};

export default ProductCardSkeleton;
