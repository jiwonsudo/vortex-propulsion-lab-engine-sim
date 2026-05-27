import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles/global.css';

const originalConsoleWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('THREE.Clock: This module has been deprecated')
  ) {
    return;
  }

  originalConsoleWarn(...args);
};

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
