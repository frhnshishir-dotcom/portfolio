import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './styles/global.css';
import { App } from './App';

const root = createRoot(document.getElementById('root')!);
const texture = new URLSearchParams(window.location.search).get('texture');

if (import.meta.env.DEV && texture) {
  // Asset tooling only: see tools/render-face-textures.mjs.
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';
  void import('./dev/TextureSheet').then(({ TextureSheet }) => {
    root.render(<TextureSheet layer={texture} />);
  });
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
