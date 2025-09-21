import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ColorModeProvider } from './components/common/ColorModeContext';

// Redux uchun importlar
import { Provider } from 'react-redux';
import store from './store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ColorModeProvider>
        <CssBaseline />
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ColorModeProvider>
    </Provider>
  </React.StrictMode>
);
