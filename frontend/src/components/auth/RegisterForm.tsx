// src/components/auth/RegisterForm.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { registerUser, loginUser } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';

const schema = yup.object().shape({
  username: yup.string().required("Foydalanuvchi nomi majburiy"),
  password: yup.string()
    .min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak")
    .required("Parol majburiy"),
  email: yup.string()
    .email("Noto'g'ri email format")
    .required("Email majburiy"),
  first_name: yup.string().required("Ism majburiy"),
  last_name: yup.string().required("Familiya majburiy"),
  phone_number: yup.string().required("Telefon raqam majburiy"),
  address: yup.string().required("Manzil majburiy"),
});

// yup sxemadan tip chiqarib oldik
type RegisterFormData = InferType<typeof schema>;

const RegisterForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
  await dispatch(registerUser(data as any)).unwrap();
  // Majburiy buyer sifatida yaratiladi; foydalanuvchidan qo'shimcha rol so'ramaymiz
  const loginPayload = await dispatch(loginUser({ username: data.username, password: data.password })).unwrap();
  const role = loginPayload?.user?.role || 'buyer';
  navigate(role === 'seller' ? '/dashboard' : '/');
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ro'yxatdan o'tish
      </Typography>

      <TextField margin="normal" required fullWidth
        label="Foydalanuvchi nomi" {...register('username')}
        error={!!errors.username} helperText={errors.username?.message} />

      <TextField margin="normal" required fullWidth
        label="Email" type="email" {...register('email')}
        error={!!errors.email} helperText={errors.email?.message} />

      <TextField margin="normal" required fullWidth
        label="Parol" type="password" {...register('password')}
        error={!!errors.password} helperText={errors.password?.message} />

      <TextField margin="normal" required fullWidth
        label="Ism" {...register('first_name')}
        error={!!errors.first_name} helperText={errors.first_name?.message} />

      <TextField margin="normal" required fullWidth
        label="Familiya" {...register('last_name')}
        error={!!errors.last_name} helperText={errors.last_name?.message} />

      <TextField margin="normal" required fullWidth
        label="Telefon raqami" {...register('phone_number')}
        error={!!errors.phone_number} helperText={errors.phone_number?.message} />

      <TextField margin="normal" required fullWidth
        label="Manzil" {...register('address')}
        error={!!errors.address} helperText={errors.address?.message} />

  {/* Rol tanlash olib tashlandi: barcha ro'yxatdan o'tganlar buyer */}

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Yaratish
      </Button>
    </Box>
  );
};

export default RegisterForm;
