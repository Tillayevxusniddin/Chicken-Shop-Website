import { __testEndpointHelper } from '../services/products';

describe('endpoint helper', () => {
  it('removes duplicate /api when base ends with /api', () => {
    const base = 'http://localhost:8000/api';
    expect(__testEndpointHelper(base, '/api/products/')).toBe('/products/');
  });
  it('keeps path when base has no trailing /api', () => {
    const base = 'http://localhost:8000';
    expect(__testEndpointHelper(base, '/api/products/')).toBe('/api/products/');
  });
});
