import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently crossing the middle of the viewport.
 * Sections can mount later (each loads its own data), so the DOM is watched until they exist.
 * Falls back to the first id.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState();
  const key = ids.join('|');

  useEffect(() => {
    const sectionIds = key ? key.split('|') : [];
    if (!sectionIds.length) return undefined;

    let observed = 0;
    const intersection = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );

    const connect = () => {
      const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
      if (elements.length === observed) return;
      observed = elements.length;
      intersection.disconnect();
      elements.forEach((element) => intersection.observe(element));
      if (observed === sectionIds.length) mutations.disconnect();
    };

    const mutations = new MutationObserver(connect);
    mutations.observe(document.body, { childList: true, subtree: true });
    connect();

    return () => {
      mutations.disconnect();
      intersection.disconnect();
    };
  }, [key]);

  return active ?? ids[0];
}
