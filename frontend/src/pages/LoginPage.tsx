// src/pages/LoginPage.tsx
import { Container, Box } from '@mui/material';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LoginForm />
      </Box>
    </Container>
  );
};
export default LoginPage;