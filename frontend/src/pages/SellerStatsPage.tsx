import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import type { SellerStats } from '../services/statsApi';
import { fetchSellerStats } from '../services/statsApi';

const SellerStatsPage = () => {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchSellerStats();
        setStats(data);
      } catch (e: any) {
        setError(e.message || 'Xatolik');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Container sx={{ mt: 6 }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 6 }}><Typography color="error">{error}</Typography></Container>;
  if (!stats) return null;

  const statusEntries = Object.entries(stats.status_breakdown);
  const maxStatus = Math.max(1, ...statusEntries.map(([, v]) => v));

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h3" gutterBottom>Statistika</Typography>
      <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', sm:'repeat(2,1fr)', md:'repeat(4,1fr)'} }}>
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle2" color="text.secondary">Jami buyurtmalar</Typography>
          <Typography variant="h4">{stats.total_orders}</Typography>
        </Paper>
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle2" color="text.secondary">Yakunlangan</Typography>
          <Typography variant="h4">{stats.total_completed}</Typography>
        </Paper>
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle2" color="text.secondary">Yakunlangan og'irlik (kg)</Typography>
          <Typography variant="h4">{stats.total_weight_completed.toFixed(2)}</Typography>
        </Paper>
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle2" color="text.secondary">Oxirgi 7 kun jami</Typography>
          <Typography variant="h4">{stats.last7days.reduce((a,b)=>a+b.count,0)}</Typography>
        </Paper>
      </Box>

      <Box sx={{ display:'grid', gap:2, gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr'}, mt:2 }}>
        <Paper sx={{ p:2 }}>
          <Typography variant="h6" gutterBottom>Holatlar</Typography>
          <Stack spacing={1}>
            {statusEntries.map(([k,v]) => (
              <div key={k}>
                <Typography variant="caption">{k} ({v})</Typography>
                <LinearProgress variant="determinate" value={(v/maxStatus)*100} />
              </div>
            ))}
          </Stack>
        </Paper>
        <Paper sx={{ p:2 }}>
          <Typography variant="h6" gutterBottom>Mahsulot turlari</Typography>
          <Stack spacing={1}>
            {Object.entries(stats.product_type_breakdown).map(([k,val]) => (
              <Paper key={k} variant="outlined" sx={{ p:1, display:'flex', justifyContent:'space-between' }}>
                <Typography variant="body2">{k}</Typography>
                <Typography variant="body2">{val.quantity_kg.toFixed(2)} kg</Typography>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Paper sx={{ p:2, mt:3 }}>
        <Typography variant="h6" gutterBottom>Oxirgi 7 kun</Typography>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
          {stats.last7days.map(d => (
            <Paper key={d.date} sx={{ p:1, flex:1 }} variant="outlined">
              <Typography variant="caption">{d.date.slice(5)}</Typography>
              <Typography variant="body2">{d.count} ta</Typography>
              <Typography variant="caption" color="text.secondary">{d.completed_weight.toFixed(1)} kg</Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default SellerStatsPage;
