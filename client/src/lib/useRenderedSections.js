import { useEffect, useMemo, useState } from 'react';
import { usePageLayout } from '@/features/page/usePageLayout';
import { NAV_LINKS } from './sections';

const NAV_IDS = NAV_LINKS.map((link) => link.id);

const inPageOrder = (a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

/**
 * The ids from `ids` whose element is in the DOM, in page order. Sections mount late (each loads its own data),
 * render nothing when empty and follow the saved page layout, so the document is watched while mounted.
 */
export function useRenderedSections(ids) {
  const [rendered, setRendered] = useState([]);
  const key = ids.join('|');

  useEffect(() => {
    const sectionIds = key.split('|');
    const update = () => {
      const next = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .sort(inPageOrder)
        .map((element) => element.id);
      setRendered((current) => (current.join('|') === next.join('|') ? current : next));
    };

    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    update();
    return () => observer.disconnect();
  }, [key]);

  return rendered;
}

/** Navbar / footer links for the sections that are actually on the page, in page order, with their saved labels. */
export function useNavLinks() {
  const rendered = useRenderedSections(NAV_IDS);
  const navLabels = usePageLayout().data?.navLabels;
  return useMemo(
    () =>
      rendered.map((id) => {
        const link = NAV_LINKS.find((item) => item.id === id);
        return { ...link, label: navLabels?.[link.key] || link.label };
      }),
    [rendered, navLabels],
  );
}

/** The home's navbar links read from the saved page layout, for pages that do not render those sections. */
export function useHomeNavLinks() {
  const { data } = usePageLayout();
  return useMemo(
    () =>
      (data?.sections ?? [])
        .map((key) => NAV_LINKS.find((link) => link.key === key))
        .filter(Boolean)
        .map((link) => ({ ...link, label: data?.navLabels?.[link.key] || link.label })),
    [data],
  );
}
