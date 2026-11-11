import { useEffect, useRef, useState } from 'react';
import { LuRotateCw, LuSmartphone } from 'react-icons/lu';
import { GIFT_MODEL_PATH } from '../../data/gifts.js';
import BouquetFallback from './BouquetFallback.jsx';

// Google <model-viewer>: free, no account. Loaded on demand (not bundled) from a pinned version.
const MV_URL = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
let loading = null;

function loadModelViewer() {
  if (typeof customElements !== 'undefined' && customElements.get('model-viewer')) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = MV_URL;
      s.onerror = () => reject(new Error('Could not load the 3D viewer'));
      document.head.appendChild(s);
      const timer = setTimeout(() => reject(new Error('The 3D viewer took too long to load')), 20000);
      customElements.whenDefined('model-viewer').then(() => {
        clearTimeout(timer);
        resolve();
      });
    }).catch((e) => {
      loading = null; // allow a retry
      throw e;
    });
  }
  return loading;
}

const modelUrl = () => new URL(GIFT_MODEL_PATH, document.baseURI).href;

/**
 * Interactive 3D bouquet + real AR launch (WebXR → Android Scene Viewer → iPhone Quick Look).
 * Always leaves the student with something to look at: if the viewer or model can't load, a
 * still bouquet and a "try again" button are shown instead of a blank screen.
 */
export default function BouquetViewer({ name }) {
  const [status, setStatus] = useState('loading'); // loading | ready | failed
  const [progress, setProgress] = useState(0);
  const [canAR, setCanAR] = useState(null); // null = unknown yet
  const [attempt, setAttempt] = useState(0);
  const [arMsg, setArMsg] = useState('');
  const ref = useRef(null);

  // 1) load the viewer library
  const [libReady, setLibReady] = useState(false);
  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setLibReady(false);
    loadModelViewer()
      .then(() => alive && setLibReady(true))
      .catch(() => alive && setStatus('failed'));
    return () => {
      alive = false;
    };
  }, [attempt]);

  // 2) listen to the element once it exists
  useEffect(() => {
    const el = ref.current;
    if (!libReady || !el) return undefined;
    const onProgress = (e) => setProgress(Math.round((e.detail?.totalProgress || 0) * 100));
    const onLoad = () => {
      setStatus('ready');
      setCanAR(Boolean(el.canActivateAR));
    };
    const onError = () => setStatus('failed');
    const onAR = (e) => {
      const st = e.detail?.status;
      if (st === 'failed') setArMsg("AR couldn't start on this phone. You can still spin the bouquet around!");
      else if (st === 'session-started' || st === 'object-placed') setArMsg('');
    };
    el.addEventListener('progress', onProgress);
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    el.addEventListener('ar-status', onAR);
    // The "can activate AR" flag settles shortly after load.
    const t = setTimeout(() => setCanAR(Boolean(el.canActivateAR)), 2500);
    return () => {
      clearTimeout(t);
      el.removeEventListener('progress', onProgress);
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onError);
      el.removeEventListener('ar-status', onAR);
    };
  }, [libReady, attempt]);

  if (status === 'failed') {
    return (
      <div className="viewer viewer--fallback" role="group" aria-label={`A bouquet for ${name}`}>
        <BouquetFallback />
        <p className="viewer-note">
          The 3D bouquet is taking a nap (this can happen on a slow connection). Your flowers are safe!
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setAttempt((n) => n + 1)}>
          <LuRotateCw aria-hidden="true" /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="viewer" role="group" aria-label={`3D bouquet for ${name}. Drag to turn it around.`}>
      {libReady && (
        <model-viewer
          key={attempt}
          ref={ref}
          class="viewer-mv"
          src={modelUrl()}
          alt={`A bouquet of red, pink and white roses wrapped in blush paper with a red satin ribbon, made for ${name}`}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          ar-placement="floor"
          camera-controls
          auto-rotate
          auto-rotate-delay="1500"
          rotation-per-second="14deg"
          touch-action="pan-y"
          camera-orbit="25deg 72deg auto"
          min-camera-orbit="auto 20deg auto"
          max-camera-orbit="auto 105deg auto"
          shadow-intensity="1"
          shadow-softness="0.9"
          exposure="1.05"
          environment-image="neutral"
          reveal="auto"
        >
          <button slot="ar-button" type="button" className="btn btn-primary btn-lg ar-btn">
            <LuSmartphone aria-hidden="true" /> View Your Bouquet in AR
          </button>
        </model-viewer>
      )}
      {status === 'loading' && (
        <div className="viewer-loading" role="status" aria-live="polite">
          <BouquetFallback small />
          <p>Gathering your flowers{progress ? `… ${progress}%` : '…'}</p>
          <span className="viewer-bar" aria-hidden="true">
            <i style={{ width: `${Math.max(6, progress)}%` }} />
          </span>
        </div>
      )}
      {status === 'ready' && canAR === false && (
        <p className="viewer-note" role="status">
          This device can't place flowers in the room, but you can drag to turn the bouquet around. To see it in AR, open this page on a phone: Chrome on Android, or Safari on iPhone.
        </p>
      )}
      {status === 'ready' && canAR && (
        <p className="viewer-note" role="status">
          Tap the button, point your phone at the floor or a table, and slowly move it around. Then drag to place the bouquet and pinch to resize it.
        </p>
      )}
      {arMsg && (
        <p className="viewer-note viewer-note--warn" role="alert">
          {arMsg}
        </p>
      )}
    </div>
  );
}
