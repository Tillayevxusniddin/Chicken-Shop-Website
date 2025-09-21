import api from './api';

export interface OrderReport {
  id: number;
  report_type: 'daily' | 'range';
  start_date: string | null;
  end_date: string | null;
  status: string;
  file_path: string;
  created_at: string;
  error_message?: string | null;
}

export async function createReport(payload: {
  report_type: 'daily' | 'range';
  start_date: string;
  end_date?: string;
}) {
  const { data } = await api.post('/orders/create_report/', payload);
  return data as OrderReport;
}

export async function listReports() {
  const { data } = await api.get<OrderReport[]>('/orders/reports/');
  return data;
}

export async function downloadReport(id: number) {
  const response = await api.get(`/orders/${id}/download_report/`, {
    responseType: 'blob',
  });
  return response.data as Blob;
}
