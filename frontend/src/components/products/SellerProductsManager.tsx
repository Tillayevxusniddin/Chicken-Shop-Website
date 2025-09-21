import { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Table, TableHead, TableRow, TableCell, TableBody, Stack, Switch, TableSortLabel, TablePagination } from '@mui/material';
import { fetchProducts, createProduct, updateProduct, deleteProduct, toggleAvailability, updateStock } from '../../services/products';
import type { Product } from '../../types/product';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface FormState {
  id?: number;
  name: string;
  product_type: 'leg' | 'wing' | 'breast';
  description: string;
  is_available: boolean;
  stock_kg: number;
}

const emptyForm: FormState = {
  name: '',
  product_type: 'leg',
  description: '',
  is_available: true,
  stock_kg: 0,
};

interface SellerProductsManagerProps {
  initialRows?: Product[];
  skipFetch?: boolean;
  fetchImpl?: (page:number,pageSize:number)=>Promise<{results:Product[]}>;
  updateStockImpl?: (id:number,val:number)=>Promise<Product>;
  debounceMs?: number;
}

const SellerProductsManager = ({ initialRows = [], skipFetch = false, fetchImpl, updateStockImpl, debounceMs = 600 }: SellerProductsManagerProps) => {
  const [rows, setRows] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<keyof Product>('name');
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await (fetchImpl ? fetchImpl(1,100) : fetchProducts(1, 100));
      setRows(data.results);
    } catch(e:any){
      setError(e?.message || 'Yuklashda xatolik');
    } finally { setLoading(false); }
  }, [fetchImpl]);

  useEffect(() => { if (initialRows.length) setRows(initialRows); }, [initialRows]);
  useEffect(() => { if(!skipFetch) load(); }, [load, skipFetch]);

  const handleRequestSort = (property: keyof Product) => {
    const isAsc = orderBy === property && orderDir === 'asc';
    setOrderDir(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sorted = [...rows].sort((a,b) => {
    const aVal = a[orderBy];
    const bVal = b[orderBy];
    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (aVal < bVal) return orderDir === 'asc' ? -1 : 1;
    return orderDir === 'asc' ? 1 : -1;
  });

  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_:unknown, newPage:number) => setPage(newPage);
  const handleChangeRowsPerPage = (e:React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value,10)); setPage(0); };

  const handleOpenCreate = () => { setForm(emptyForm); setOpen(true); };
  const handleOpenEdit = (p: Product) => { setForm({ id: p.id, name:p.name, product_type:p.product_type, description:p.description, is_available:p.is_available, stock_kg: p.stock_kg }); setOpen(true); };
  const handleClose = () => { if(!saving) setOpen(false); };

  const handleChange = (field: keyof FormState, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if(form.id){
        const updated = await updateProduct(form.id, { name: form.name, product_type: form.product_type, description: form.description, is_available: form.is_available, stock_kg: form.stock_kg });
        setRows(r => r.map(x => x.id === updated.id ? updated : x));
      } else {
        const created = await createProduct({ name: form.name, product_type: form.product_type, description: form.description, is_available: form.is_available, stock_kg: form.stock_kg } as any);
        setRows(r => [created, ...r]);
      }
      setOpen(false);
    } catch(e:any){
      setError(e?.message || 'Saqlashda xatolik');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id:number) => {
    if(!confirm('O`chirishni tasdiqlang?')) return;
    await deleteProduct(id);
    setRows(r => r.filter(p => p.id !== id));
  };

  const handleToggle = async (p: Product) => {
    const updated = await toggleAvailability(p.id, !p.is_available);
    setRows(r => r.map(x => x.id === p.id ? updated : x));
  };

  // Debounced inline stock editing
  const stockTimers = useRef<Record<number, NodeJS.Timeout>>({});
  const pendingValues = useRef<Record<number, number>>({});
  const [savingStockIds, setSavingStockIds] = useState<Set<number>>(new Set());

  const scheduleStockSave = (p: Product, raw: string) => {
    const value = parseFloat(raw);
    if (isNaN(value) || value < 0) return; // ignore invalid
    // Optimistic update immediately
    setRows(r => r.map(x => x.id === p.id ? { ...x, stock_kg: value } : x));
    pendingValues.current[p.id] = value;
    if (stockTimers.current[p.id]) clearTimeout(stockTimers.current[p.id]);
    const runSave = async () => {
      const desired = pendingValues.current[p.id];
      if (desired === undefined || desired === p.stock_kg) return; // no change needed
      setSavingStockIds(s => new Set([...s, p.id]));
      try {
  const updated = await (updateStockImpl ? updateStockImpl(p.id, desired) : updateStock(p.id, desired));
        setRows(r => r.map(x => x.id === p.id ? updated : x));
      } catch (e:any) {
        // revert on error: reload product list fallback
        setError(e?.message || 'Stock yangilashda xatolik');
        load();
      } finally {
        setSavingStockIds(s => { const n = new Set(s); n.delete(p.id); return n; });
        delete pendingValues.current[p.id];
      }
    };
    if (debounceMs <= 0) {
      runSave();
    } else {
      stockTimers.current[p.id] = setTimeout(runSave, debounceMs);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:2 }}>
        <h2>Mahsulotlarni boshqarish</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Yangi mahsulot</Button>
      </Stack>
      {error && <Box sx={{ color:'error.main', mb:2 }}>{error}</Box>}
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sortDirection={orderBy === 'name' ? orderDir : false}>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? orderDir : 'asc'}
                onClick={() => handleRequestSort('name')}
              >Nom</TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === 'product_type' ? orderDir : false}>
              <TableSortLabel
                active={orderBy === 'product_type'}
                direction={orderBy === 'product_type' ? orderDir : 'asc'}
                onClick={() => handleRequestSort('product_type')}
              >Turi</TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === 'stock_kg' ? orderDir : false}>
              <TableSortLabel
                active={orderBy === 'stock_kg'}
                direction={orderBy === 'stock_kg' ? orderDir : 'asc'}
                onClick={() => handleRequestSort('stock_kg')}
              >Stock (kg)</TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === 'is_available' ? orderDir : false}>
              <TableSortLabel
                active={orderBy === 'is_available'}
                direction={orderBy === 'is_available' ? orderDir : 'asc'}
                onClick={() => handleRequestSort('is_available')}
              >Holat</TableSortLabel>
            </TableCell>
            <TableCell>Amallar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map(p => (
            <TableRow key={p.id} hover>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.product_type}</TableCell>
              <TableCell>
                <TextField
                  type="number" size="small"
                  value={p.stock_kg}
                  onChange={(e) => scheduleStockSave(p, e.target.value)}
                  inputProps={{ step: '0.01', min: 0 }}
                  disabled={savingStockIds.has(p.id)}
                />
              </TableCell>
              <TableCell>
                <Tooltip title={p.is_available ? 'Faol' : 'O`chiq'}>
                  <Switch checked={p.is_available} onChange={() => handleToggle(p)} />
                </Tooltip>
              </TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => handleOpenEdit(p)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
          {!rows.length && !loading && (
            <TableRow><TableCell colSpan={5} style={{ textAlign:'center', opacity:.7 }}>Ma`lumot yo`q</TableCell></TableRow>
          )}
          {loading && (
            <TableRow><TableCell colSpan={5} style={{ textAlign:'center' }}>Yuklanmoqda...</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5,10,25,50]}
        labelRowsPerPage="Satrlar"
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt:1 }}>
            <TextField label="Nom" fullWidth value={form.name} onChange={e => handleChange('name', e.target.value)} />
            <TextField label="Tavsif" fullWidth multiline minRows={2} value={form.description} onChange={e => handleChange('description', e.target.value)} />
            <TextField select label="Turi" fullWidth value={form.product_type} onChange={e => handleChange('product_type', e.target.value as any)} SelectProps={{ native: true }}>
              <option value="leg">leg</option>
              <option value="wing">wing</option>
              <option value="breast">breast</option>
            </TextField>
            <TextField type="number" label="Stock (kg)" fullWidth value={form.stock_kg} onChange={e => handleChange('stock_kg', parseFloat(e.target.value)||0)} inputProps={{ step:'0.01', min:0 }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Bekor qilish</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerProductsManager;
