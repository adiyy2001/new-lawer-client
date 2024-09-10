import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode; // Function to render custom fallback UI
  onError?: (error: Error, errorInfo: ErrorInfo) => void; // Optional error handler
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary wraps child components to handle JavaScript errors, log them, and
 * display a fallback UI instead of the component tree that crashed. It supports customization
 * through props for error handling and fallback rendering.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error('Uncaught error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.state.errorInfo)
      ) : (
        <h1>Coś poszło nie tak.</h1>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
