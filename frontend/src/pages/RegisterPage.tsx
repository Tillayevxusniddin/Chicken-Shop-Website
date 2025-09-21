// src/pages/RegisterPage.tsx
import { Container, Box } from '@mui/material';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <RegisterForm />
      </Box>
    </Container>
  );
};
export default RegisterPage;