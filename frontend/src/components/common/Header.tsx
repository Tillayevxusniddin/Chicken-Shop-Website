import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { useColorMode } from './ColorModeContext';

const Header = () => {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const cartItemCount = useAppSelector((state) => state.cart.items.length);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
    const { mode, toggle } = useColorMode();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => { /* legacy dark mode effect removed */ }, []);

  const navStyles = {
    color: 'inherit',
    textDecoration: 'none',
    margin: '0 8px', // Tugmalar orasini ozroq kichraytiramiz
    '&.active': {
      color: 'primary.contrastText',
      fontWeight: 'bold',
    },
    '&:hover': {
      textDecoration: 'underline',
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'secondary.main' }}>
      <Toolbar>
        {/* Logo / Title */}
        <Typography variant="h6" component={NavLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Tovuq Do'koni
        </Typography>

        {/* Navigation Links */}
        <Box>
          <Button component={NavLink} to="/" sx={navStyles}>Bosh Sahifa</Button>
          <Button component={NavLink} to="/products" sx={navStyles}>Mahsulotlar</Button>
          {user?.role === 'buyer' && (
            <Button component={NavLink} to="/orders" sx={navStyles}>Buyurtmalarim</Button>
          )}
          {user?.role === 'seller' && (
            <Button component={NavLink} to="/dashboard/stats" sx={navStyles}>Statistika</Button>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {accessToken ? (
            <>
              {user?.role === 'seller' && (
                <Button component={NavLink} to="/dashboard" sx={navStyles}>
                  Boshqaruv Paneli
                </Button>
              )}
              <Typography component="span" sx={{ mr: 2 }}>
                Salom, {user?.username}!
              </Typography>
              <Button onClick={handleLogout} sx={navStyles}>Chiqish</Button>
            </>
          ) : (
            <> {/* <-- Fragment qo'shildi */}
              <Button component={NavLink} to="/login" sx={navStyles}>Kirish</Button>
              {/* --- YANGI QO'SHILGAN TUGMA --- */}
              <Button component={NavLink} to="/register" sx={navStyles}>Ro'yxatdan o'tish</Button>
            </>
          )}
            <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'} placement="bottom">
              <IconButton onClick={toggle} color="inherit" size="small" sx={{ ml: 1 }}>
                {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          {user?.role === 'buyer' && (
            <IconButton component={NavLink} to="/cart" aria-label="cart" sx={{ color: 'white', ml: 1 }}>
              <Badge badgeContent={cartItemCount} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
