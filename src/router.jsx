import { useEffect, useState } from 'react';

// Tiny hash router. Hash URLs work on any static host (and QR codes) without server rewrites.
export function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(query)) };
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function navigate(to, { replace = false } = {}) {
  const target = '#' + to;
  // Going to the address we are already on fires no hashchange, so nudge the router ourselves
  // (e.g. signing in while the URL already says #/admin/dashboard).
  if (window.location.hash === target) {
    window.dispatchEvent(new Event('hashchange'));
    return;
  }
  if (replace) window.location.replace(target);
  else window.location.hash = to;
}

export function Link({ to, children, ...rest }) {
  return (
    <a href={'#' + to} {...rest}>
      {children}
    </a>
  );
}

export function Redirect({ to }) {
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to]);
  return null;
}
