import { motion, useReducedMotion } from 'framer-motion';
import { useId, useRef, useState } from 'react';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../../components/buttonStyles';
import { IDENTITY } from './constants';
import DisplayOptionsTab from './DisplayOptionsTab';
import HeadlineImagesTab from './HeadlineImagesTab';
import LabelsTab from './LabelsTab';

const TABS = [
  { key: 'labels', label: IDENTITY.tabs.labels, Panel: LabelsTab },
  { key: 'images', label: IDENTITY.tabs.images, Panel: HeadlineImagesTab },
  { key: 'display', label: IDENTITY.tabs.display, Panel: DisplayOptionsTab },
];

/**
 * Figma 546:11992: tab bar + panel card. Arrow keys / Home / End move between tabs (roving tabindex). Every
 * panel stays mounted (hidden when inactive) so its fields keep their state.
 */
export default function ContentTabs({ index, ...panelProps }) {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [active, setActive] = useState(TABS[0].key);
  const tabRefs = useRef({});

  const selectTab = (key) => {
    setActive(key);
    tabRefs.current[key]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  const focusTab = (key) => {
    selectTab(key);
    tabRefs.current[key]?.focus();
  };

  const handleKeyDown = (event) => {
    const position = TABS.findIndex((tab) => tab.key === active);
    const next = {
      ArrowRight: (position + 1) % TABS.length,
      ArrowLeft: (position - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focusTab(TABS[next].key);
  };

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-label={IDENTITY.tabs.label}
      className="flex min-w-0 flex-col overflow-hidden rounded-card bg-neutral-surface-0"
    >
      <div
        role="tablist"
        aria-label={IDENTITY.tabs.label}
        onKeyDown={handleKeyDown}
        className="flex gap-1 overflow-x-auto bg-neutral-surface-section px-2 py-2 scheme-dark tablet:px-6"
      >
        {TABS.map((tab) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              ref={(node) => {
                tabRefs.current[tab.key] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-${tab.key}-tab`}
              aria-selected={selected}
              aria-controls={`${baseId}-${tab.key}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(tab.key)}
              className={cn(
                'h-11 flex-1 shrink-0 rounded-md px-2 text-small font-semi-bold whitespace-nowrap transition-colors tablet:h-12 tablet:flex-none tablet:px-4 tablet:text-base',
                selected ? 'bg-fill-primary text-on-brand' : 'text-neutral-text-label hover:text-text-primary',
                FOCUS_RING,
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {TABS.map(({ key, Panel }) => (
        <div
          key={key}
          role="tabpanel"
          id={`${baseId}-${key}-panel`}
          aria-labelledby={`${baseId}-${key}-tab`}
          hidden={key !== active}
          tabIndex={0}
          className="p-5 outline-none tablet:p-8"
        >
          <Panel {...panelProps} />
        </div>
      ))}
    </motion.section>
  );
}
