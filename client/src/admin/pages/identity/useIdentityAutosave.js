import { useCallback, useEffect, useRef, useState } from 'react';
import { anchorIndex, orphanedAnchors, titleWords } from '@shared/identity';
import { useAutosave } from '../../hooks/useAutosave';
import { useSaveIdentityDraft } from '../../hooks/useIdentity';
import { identitySchema, toPayload } from './identityForm';
import { IDENTITY } from './constants';

const hasOrphans = (values) => {
  const orphans = orphanedAnchors(values);
  return orphans.slots.length > 0 || orphans.lineBreak;
};

/**
 * Saves the whole form as the Identity draft (see `useAutosave`). Saving pauses (`blocked`) while the title lost
 * words that image spots / the line break hang on, waiting for the confirm dialog.
 */
export function useIdentityAutosave(form) {
  const { mutateAsync } = useSaveIdentityDraft();
  return useAutosave({
    form,
    schema: identitySchema,
    toPayload,
    save: mutateAsync,
    isBlocked: hasOrphans,
    leaveWarning: IDENTITY.save.leaveWarning,
  });
}

/**
 * Watches the title: when an edit removes a word that an image spot or the line break hangs on, `check()` (on
 * blur) opens the confirm step. `confirm()` drops those anchors; `cancel()` puts back the last title that had none.
 */
export function useOrphanGuard(form) {
  const goodTitle = useRef(form.getValues('title'));
  const [pending, setPending] = useState(null);

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name && !['title', 'imageSlots', 'lineBreak'].includes(name.split('.')[0])) return;
      if (!hasOrphans(values)) goodTitle.current = values.title;
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const check = useCallback(() => {
    const values = form.getValues();
    const orphans = orphanedAnchors(values);
    if (!orphans.slots.length && !orphans.lineBreak) return;
    const breakIsLast = orphans.lineBreak && anchorIndex(titleWords(values.title), values.lineBreak) !== -1;
    setPending({ ...orphans, lineBreakWord: values.lineBreak?.word, breakIsLast });
  }, [form]);

  const confirm = () => {
    const values = form.getValues();
    const orphans = orphanedAnchors(values);
    form.setValue(
      'imageSlots',
      values.imageSlots.filter((slot) => !orphans.slots.includes(slot)),
      { shouldDirty: true },
    );
    if (orphans.lineBreak) form.setValue('lineBreak', null, { shouldDirty: true });
    setPending(null);
  };

  const cancel = () => {
    form.setValue('title', goodTitle.current, { shouldDirty: true, shouldValidate: true });
    setPending(null);
  };

  return { pending, check, confirm, cancel };
}
