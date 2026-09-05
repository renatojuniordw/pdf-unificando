"use client";

import React from "react";
import { StateBanner } from "@/components/shared/StateBanner";
import { logError } from "@/lib/utils/logger";

interface LocalErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  message?: string;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface LocalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class LocalErrorBoundary extends React.Component<
  LocalErrorBoundaryProps,
  LocalErrorBoundaryState
> {
  state: LocalErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): LocalErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError("Local Error Boundary", error, {
      componentStack: info.componentStack,
    });
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="local-error-boundary" className="max-w-2xl mx-auto">
          <StateBanner
            tone="error"
            title={this.props.title ?? "ERRO NA FERRAMENTA"}
            message={
              this.props.message ??
              "Algo falhou neste bloco da tela. Você pode tentar novamente sem recarregar a página."
            }
            actionLabel="Tentar novamente"
            onAction={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
