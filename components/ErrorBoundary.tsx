'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex-1 p-6 flex flex-col items-center justify-center border border-rose-900/50 bg-rose-950/20 m-6 rounded-lg text-rose-500 font-mono text-sm h-full">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-bold tracking-wider uppercase">Decoder Failure</h2>
          </div>
          <p className="text-rose-400/80 mb-4">{this.state.error?.message || 'An unhandled exception occurred in the decoder loop.'}</p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 transition-colors border border-rose-800 rounded text-rose-300 text-xs uppercase tracking-widest"
          >
            Restart Engine
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
