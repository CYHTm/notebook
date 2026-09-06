import { Component, StrictMode } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/400.css";
import "./styles.css";
import App from "./App";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("XBOOK LAB render error", error, info.componentStack);
  }
  render() {
    if (this.state.failed)
      return (
        <main className="error-boundary">
          <h1>Не удалось открыть раздел.</h1>
          <p>
            Локальные данные не удалены. Перезагрузите страницу, чтобы
            попробовать ещё раз.
          </p>
          <button
            className="button button-primary"
            onClick={() => window.location.reload()}
          >
            Перезагрузить страницу
          </button>
        </main>
      );
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
