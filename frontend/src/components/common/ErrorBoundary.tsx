import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: any }

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: any): ErrorBoundaryState { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error('UI error boundary caught:', error, info); }
  handleRetry = () => { this.setState({ hasError: false, error: undefined }); };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h2>Biror narsa xato ketdi.</h2>
          <p style={{ opacity: .8 }}>Sahifani qayta yuklash yoki pastdagi tugmani bosing.</p>
          <button onClick={this.handleRetry} style={{ marginTop: 16, padding: '10px 22px', borderRadius: 14, cursor: 'pointer', background:'linear-gradient(135deg,#ffb300,#ff6f00)', border:'none', color:'#1d1300', fontWeight:600 }}>Qayta urinish</button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
