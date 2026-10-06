import { useCallback, useEffect, useRef, useState } from 'react';

/** The draft is saved once nothing has changed for this long. */
const SAVE_DELAY_MS = 800;

/**
 * Saves the whole form as a draft after a short pause. Only the latest values are sent, one request at a time.
 * Nothing is sent while the form fails `schema` (`invalid`) or `isBlocked(values)` is true (`blocked`).
 * `save(payload)` sends `toPayload(values)`.
 * `status`: saved | saving | invalid | blocked | error. Leaving the page with unsaved changes asks first
 * (`leaveWarning`); a pending save is still sent when the page unmounts.
 */
export function useAutosave({ form, schema, toPayload, save: send, isBlocked, leaveWarning }) {
  const [status, setStatus] = useState('saved');
  const lastSaved = useRef(JSON.stringify(toPayload(form.getValues())));
  const timer = useRef(null);
  const inFlight = useRef(false);
  const queued = useRef(false);

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    timer.current = null;
    if (inFlight.current) {
      queued.current = true;
      return;
    }

    const values = form.getValues();
    if (!schema.safeParse(values).success) {
      setStatus('invalid');
      form.trigger();
      return;
    }
    if (isBlocked?.(values)) {
      setStatus('blocked');
      return;
    }
    const payload = toPayload(values);
    const body = JSON.stringify(payload);
    if (body === lastSaved.current) {
      setStatus('saved');
      return;
    }

    inFlight.current = true;
    setStatus('saving');
    try {
      await send(payload);
      lastSaved.current = body;
      if (!timer.current) setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      inFlight.current = false;
      if (queued.current) {
        queued.current = false;
        save();
      }
    }
  }, [form, schema, toPayload, send, isBlocked]);

  useEffect(() => {
    const subscription = form.watch(() => {
      clearTimeout(timer.current);
      setStatus('saving');
      timer.current = setTimeout(save, SAVE_DELAY_MS);
    });
    return () => subscription.unsubscribe();
  }, [form, save]);

  useEffect(
    () => () => {
      if (timer.current) save();
    },
    [save],
  );

  useEffect(() => {
    if (status === 'saved') return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = leaveWarning;
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [status, leaveWarning]);

  /** After the form is reset to server values (discard), treat them as already saved. */
  const markSaved = useCallback(
    (values) => {
      clearTimeout(timer.current);
      timer.current = null;
      lastSaved.current = JSON.stringify(toPayload(values));
      setStatus('saved');
    },
    [toPayload],
  );

  return { status, retry: save, markSaved };
}
