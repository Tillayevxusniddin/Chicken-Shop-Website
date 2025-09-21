// src/components/auth/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { loginUser } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';

const schema = yup.object().shape({
  username: yup.string().required("Foydalanuvchi nomi majburiy"),
  password: yup.string().required("Parol majburiy"),
});

// yup sxemadan TypeScript tipi chiqaramiz
type LoginFormData = InferType<typeof schema>;

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
  const payload = await dispatch(loginUser(data)).unwrap();
  const role = payload?.user?.role || payload?.user?.user_role || 'buyer';
  navigate(role === 'seller' ? '/dashboard' : '/');
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tizimga kirish
      </Typography>

      <TextField margin="normal" required fullWidth
        label="Foydalanuvchi nomi" {...register('username')}
        error={!!errors.username} helperText={errors.username?.message} />

      <TextField margin="normal" required fullWidth
        label="Parol" type="password" {...register('password')}
        error={!!errors.password} helperText={errors.password?.message} />

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Kirish
      </Button>
    </Box>
  );
};

export default LoginForm;
