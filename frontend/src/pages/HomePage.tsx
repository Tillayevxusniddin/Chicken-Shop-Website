// src/pages/HomePage.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, scaleIn, itemFade } from '../animations/variants';
import { Box, Container, Typography, Stack, Button, Card, CardContent } from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Section from '../components/common/Section';
import ProductCard from '../components/products/ProductCard';
import ProductCardSkeleton from '../components/products/ProductCardSkeleton';
import { useInfiniteProducts } from '../hooks/useInfiniteProducts';

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products, page, hasMore, loading, error, loadNext, reloadFirst } = useInfiniteProducts({ pageSize: 6 });

  // On mount: read ?page=
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const p = parseInt(params.get('page') || '1', 10);
    reloadFirst();
    if (p > 1) {
      // load additional pages sequentially until p
      (async () => {
        for (let i = 2; i <= p; i++) await loadNext();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When page changes (after successful load) push to URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const current = parseInt(params.get('page') || '1', 10);
  if (current !== page) {
      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }
      const query = params.toString();
      navigate({ pathname: location.pathname, search: query ? `?${query}` : '' }, { replace: true });
    }
  }, [page, location.pathname, location.search, navigate]);

  const handleLoadMore = () => { if (hasMore && !loading) loadNext(); };

  // Infinite scroll sentinel
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadNext();
        }
      });
    }, { rootMargin: '400px 0px 0px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadNext]);

  return (
    <Box>
      {/* Hero */}
      <Box
        className="hero-gradient"
        sx={{
          position: 'relative',
          py: { xs: 10, md: 16 },
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 6, md: 8 },
              alignItems: 'center',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
            }}
          >
            <Box>
              <Stack component={motion.div} spacing={3} variants={fadeUp} initial="hidden" animate="visible">
                <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 600 }} color="secondary">
                  FRESH POULTRY
                </Typography>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  Sifatli Tovuq Mahsulotlari
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 520 }} className="text-balance">
                  Yangi va sifat nazoratidan o'tgan qismlarni qulay onlayn buyurtma qiling. Tezkor yetkazib berish va ishonchli xizmat.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button component={NavLink} to="/products" size="large" variant="contained">
                    Mahsulotlarni ko'rish
                  </Button>
                  <Button component={NavLink} to="/register" size="large" variant="outlined" color="secondary">
                    Ro'yxatdan o'tish
                  </Button>
                </Stack>
              </Stack>
            </Box>
            <Box component={motion.div} variants={scaleIn} initial="hidden" animate="visible">
              <Box sx={{
                position: 'relative',
                width: '100%',
                borderRadius: 6,
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: { xs: 120, md: 180 },
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.15))'
              }}>
                <Box
                  sx={{
                    animation: 'floatY 6s ease-in-out infinite',
                    '@keyframes floatY': {
                      '0%,100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-22px)' }
                    }
                  }}
                >
                  🐔
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Featured Products */}
      <Section
        title="Mashhur Mahsulotlar"
        subtitle="Eng ko'p sotilayotgan va mijozlar yoqtirgan tovuq qismlari."
        gradient
        id="featured"
      >
        {error && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>{error}</Typography>
            <Button variant="outlined" size="small" onClick={() => reloadFirst()} disabled={loading}>Qayta urinish</Button>
          </Box>
        )}
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            }
          }}
        >
          <AnimatePresence>
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                custom={i}
                variants={itemFade}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ y: -6 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && Array.from({ length: page === 1 ? 6 : Math.min(3, 6) }).map((_, i) => (
            <ProductCardSkeleton key={`sk-${i}-${page}`} />
          ))}
        </Box>
        <Stack alignItems="center" mt={6}>
          <Button component={NavLink} to="/products" variant="outlined" size="large">
            Barcha mahsulotlarni ko'rish
          </Button>
          {hasMore && (
            <Button onClick={handleLoadMore} variant="text" size="large" sx={{ mt: 2 }} disabled={loading}>
              {loading ? 'Yuklanmoqda...' : 'Yana yuklash'}
            </Button>
          )}
          {/* Sentinel for infinite scroll */}
          {hasMore && <Box ref={sentinelRef} sx={{ width: '100%', height: 1 }} />}
        </Stack>
      </Section>

      {/* Value Props */}
      <Section title="Nega biz?" subtitle="Biz sizga yuqori sifat va shaffof xizmatni taqdim etamiz." id="values">
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            }
          }}
        >
          {[
            { title: 'Tezkor Yetkazib Berish', desc: 'Qisqa vaqt ichida eshigingizda.', icon: '⚡' },
            { title: 'Nazorat va Sifat', desc: 'Gigiyena va sifat standartlariga mos.', icon: '✅' },
            { title: 'Qulay Buyurtma', desc: 'Tez va oson jarayon.', icon: '🛒' },
            { title: 'Doimiy Yangilanish', desc: 'Real vaqt statistikalar.', icon: '📊' },
          ].map(item => (
            <Card key={item.title} sx={{ height: '100%', position:'relative', overflow:'hidden' }} className="fade-in">
              <CardContent>
                <Box sx={{ fontSize: 42, mb: 1 }}>{item.icon}</Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Section>

      {/* CTA Band */}
      <Box sx={(theme) => ({
        py: 10,
        background: theme.palette.gradient.primary,
        color: theme.palette.primary.contrastText,
        textAlign: 'center'
      })}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Hoziroq buyurtma bering va sifatni his eting
          </Typography>
          <Typography variant="h6" sx={{ opacity: .9, mb: 4 }}>
            Tezkor yetkazib berish va yangilanishlar bilan qulay xarid tajribasi.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button component={NavLink} to="/products" size="large" variant="contained" color="secondary">
              Xaridni boshlash
            </Button>
            <Button component={NavLink} to="/register" size="large" variant="outlined" sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,.6)' }}>
              Ro'yxatdan o'tish
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
