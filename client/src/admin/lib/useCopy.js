import { useEffect, useState } from 'react';

const FEEDBACK_MS = 2000;

/** Copies `text` to the clipboard. `status` is `idle`, then `copied` or `failed` for a moment. */
export function useCopy(text) {
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (status === 'idle') return undefined;
    const timer = setTimeout(() => setStatus('idle'), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  return { status, copy };
}
