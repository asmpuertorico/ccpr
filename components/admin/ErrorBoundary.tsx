"use client";
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Admin Panel Error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-4">
        {error?.message || "An unexpected error occurred in the admin panel."}
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={resetError}
          className="inline-flex items-center rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-md border border-red-300 bg-white text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-50"
        >
          Reload Page
        </button>
      </div>
      {process.env.NODE_ENV === "development" && error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
            Technical Details
          </summary>
          <pre className="mt-2 text-xs bg-red-100 p-3 rounded overflow-auto text-red-800">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

export default ErrorBoundary;

