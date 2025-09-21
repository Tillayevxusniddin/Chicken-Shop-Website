// src/pages/SellerDashboardPage.tsx
import { useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Stack, TextField, MenuItem, Button, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import StatCard from '../components/dashboard/StatCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders, setOrderFilters, setOrderPage } from '../store/orderSlice';
import { createReport, listReports, downloadReport, type OrderReport } from '../services/reportApi';
import { useState, useEffect as useLayoutEffect } from 'react';
import { fetchSellerStats, type SellerStats } from '../services/statsApi';
import OrdersTable from '../components/dashboard/OrdersTable'; // Hozir yaratamiz
import useWebSocketOrders from '../hooks/useWebSocketOrders';

const SellerDashboardPage = () => {
  const dispatch = useAppDispatch();
  const { orders, status, error, meta } = useAppSelector((state) => state.orders);
  const filters = useAppSelector((s) => s.orders.filters);
  const [reports, setReports] = useState<OrderReport[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'range'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  // Load seller stats
  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await fetchSellerStats();
        if (mounted) setStats(data);
      } catch (e: any) {
        if (mounted) setStatsError(e?.message || 'Statistika xatosi');
      } finally {
        if (mounted) setStatsLoading(false);
      }
    })();
  return () => { mounted = false; };
  }, []);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch, filters]);

  // Real-time updates
  useWebSocketOrders();

  // Load reports list
  useLayoutEffect(() => {
    (async () => {
      try {
        const data = await listReports();
        setReports(data);
      } catch (_) {
        /* ignore */
      }
    })();
  }, []);

  const applyFilter = (patch: any) => {
    dispatch(setOrderFilters(patch));
  };

  const handleCreateReport = async () => {
    if (reportType === 'daily' && !startDate) return;
    if (reportType === 'range' && (!startDate || !endDate)) return;
    setReportLoading(true);
    try {
      await createReport({ report_type: reportType, start_date: startDate, end_date: reportType === 'range' ? endDate : undefined });
      const data = await listReports();
      setReports(data);
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownload = async (id: number) => {
    const blob = await downloadReport(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${id}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h2" component="h1" sx={{ mt: 4, mb: 4 }}>
        Sotuvchi Paneli
      </Typography>
      {status === 'loading' && <CircularProgress />}
      {/* Stats Overview */}
      <Box sx={{ mb: 4 }}>
        {statsError && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{statsError}</Typography>}
        <Box component={motion.div} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
        }}>
          <Box component={motion.div} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard label="Buyurtmalar" value={stats?.total_orders ?? meta.count ?? 0} delta={stats?.metrics?.week_count_delta_pct} icon="📦" loading={statsLoading} />
          </Box>
          <Box component={motion.div} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard label="Bugun" value={stats?.metrics?.today_count ?? 0} delta={stats?.metrics?.day_count_delta_pct} icon="📅" loading={statsLoading} />
          </Box>
          <Box component={motion.div} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard label="Yakunlangan" value={stats?.total_completed ?? orders.filter(o => o.status === 'completed').length} delta={0} icon="✅" loading={statsLoading} />
          </Box>
          <Box component={motion.div} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard label="Og'irlik (kg)" value={stats?.total_weight_completed ?? 0} delta={0} icon="⚖️" loading={statsLoading} />
          </Box>
        </Box>
      </Box>
      {status === 'failed' && <Typography color="error">{error}</Typography>}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField size="small" label="Qidirish" value={filters.search || ''} onChange={(e) => applyFilter({ search: e.target.value })} />
          <TextField select size="small" label="Holat" value={filters.status || ''} onChange={(e) => applyFilter({ status: e.target.value || undefined })} sx={{ minWidth: 160 }}>
            <MenuItem value="">Barchasi</MenuItem>
            <MenuItem value="pending">Kutilmoqda</MenuItem>
            <MenuItem value="reviewing">Ko'rib chiqilmoqda</MenuItem>
            <MenuItem value="process">Tayyorlanmoqda</MenuItem>
            <MenuItem value="shipping">Jo'natilmoqda</MenuItem>
            <MenuItem value="completed">Yakunlangan</MenuItem>
            <MenuItem value="cancelled">Bekor</MenuItem>
          </TextField>
          <TextField type="date" size="small" label="Boshlanish" InputLabelProps={{ shrink: true }} value={filters.start_date || ''} onChange={(e) => applyFilter({ start_date: e.target.value })} />
            <TextField type="date" size="small" label="Tugash" InputLabelProps={{ shrink: true }} value={filters.end_date || ''} onChange={(e) => applyFilter({ end_date: e.target.value })} />
          <Button variant="outlined" onClick={() => applyFilter({ search: '', status: undefined, start_date: undefined, end_date: undefined })}>Tozalash</Button>
        </Stack>
      </Paper>
      {status === 'succeeded' && <>
        <OrdersTable orders={orders} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2">Jami: {meta.count}</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" disabled={filters.page === 1} onClick={() => dispatch(setOrderPage(filters.page - 1))}>Oldingi</Button>
            <Typography variant="body2" sx={{ px: 1, alignSelf: 'center' }}>Sahifa {filters.page}</Typography>
            <Button size="small" disabled={(orders.length < filters.page_size)} onClick={() => dispatch(setOrderPage(filters.page + 1))}>Keyingi</Button>
          </Stack>
        </Box>
      </>}

      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Hisobotlar</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField select size="small" label="Turi" value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
            <MenuItem value="daily">Kunlik</MenuItem>
            <MenuItem value="range">Oraliq</MenuItem>
          </TextField>
          <TextField type="date" size="small" label="Boshlanish" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          {reportType === 'range' && (
            <TextField type="date" size="small" label="Tugash" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          )}
          <Button disabled={reportLoading} variant="contained" onClick={handleCreateReport}>{reportLoading ? 'Yaratilmoqda...' : 'Hisobot yaratish'}</Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1}>
          {reports.map(r => (
            <Paper key={r.id} variant="outlined" sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">#{r.id} {r.report_type} {r.start_date}{r.end_date ? ' - ' + r.end_date : ''} — {r.status}</Typography>
              {r.status === 'ready' && <Button size="small" onClick={() => handleDownload(r.id)}>Yuklab olish</Button>}
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default SellerDashboardPage;