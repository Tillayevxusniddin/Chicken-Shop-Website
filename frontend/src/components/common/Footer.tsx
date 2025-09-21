// src/components/common/Footer.tsx
import { Box, Container, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto', // Bu footerni sahifa pastiga yopishtiradi
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' Tovuq Do\'koni. Barcha huquqlar himoyalangan.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;