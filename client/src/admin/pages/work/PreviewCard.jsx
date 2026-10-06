import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import ProjectCard from '@/features/projects/ProjectCard';
import ProjectGallery from '@/features/projects/ProjectGallery';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import { EYEBROW } from '../../components/SectionCard';
import { useProjectsSection } from '../../hooks/useWork';
import { WORK_EDITOR, workPreviewPath } from './constants';
import { toPayload, toPublicProject } from './workForm';

const COPY = WORK_EDITOR.preview;
const VIEWS = ['page', 'card'];

/**
 * Live preview of the form (not the saved draft): a small project page with the real full / half gallery layout,
 * or the home card. "Open full preview" opens the draft as the real page in a new tab.
 */
export default function PreviewCard({ index, item, control, className }) {
  const reduce = useReducedMotion();
  const [view, setView] = useState('page');
  const values = useWatch({ control });
  const { data: section } = useProjectsSection();
  const project = toPublicProject(toPayload({ ...values, year: values.year ?? '', externalLink: values.externalLink ?? '' }));

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="work-preview-title"
      className={cn('flex min-w-0 flex-col gap-4 rounded-card bg-neutral-surface-0 p-5', className)}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="work-preview-title" className={EYEBROW}>
          {COPY.eyebrow}
        </h2>
        <div role="group" aria-label={COPY.tabsLabel} className="flex rounded-full bg-neutral-surface-raised p-1">
          {VIEWS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={cn(
                'rounded-full px-3 py-1 text-extra-small transition-colors',
                FOCUS_RING,
                view === key ? 'bg-neutral-surface-2 text-neutral-text-heading' : 'text-neutral-text-label hover:text-neutral-text-heading',
              )}
            >
              {COPY[key]}
            </button>
          ))}
        </div>
      </div>

      {view === 'page' ? (
        <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto rounded-tile bg-bg-primary p-4">
          <p className={cn('text-large font-regular', project.title ? 'text-text-primary' : 'text-neutral-text-placeholder')}>
            {project.title || COPY.emptyTitle}
          </p>
          <p className={cn('mt-2 text-extra-small whitespace-pre-line', project.description ? 'text-neutral-text-muted' : 'text-neutral-text-placeholder')}>
            {project.description || COPY.emptySummary}
          </p>
          {project.gallery?.length ? (
            <ProjectGallery compact gallery={project.gallery} title={project.title} className="mt-4" />
          ) : (
            <p className="mt-4 rounded-xs border border-dashed border-border-primary px-3 py-6 text-center text-extra-small text-neutral-text-placeholder">
              {COPY.noGallery}
            </p>
          )}
        </div>
      ) : (
        <div className="scrollbar-soft flex min-h-0 flex-col gap-2 overflow-y-auto">
          <ProjectCard
            preview
            project={{ ...project, title: project.title || COPY.emptyTitle, description: project.description || COPY.emptySummary }}
            ctaLabel={section?.cardCtaLabel}
          />
          {project.featured === false && <p className="text-extra-small text-neutral-text-placeholder">{COPY.notFeatured}</p>}
        </div>
      )}

      <p className="text-extra-small text-neutral-text-label">{COPY.draftNote}</p>
      <a
        href={workPreviewPath(item._id)}
        target="_blank"
        rel="noopener noreferrer"
        className={adminButton({ variant: 'raised', size: 'sm', className: 'w-full' })}
      >
        <ExternalLink aria-hidden className="size-4" />
        {COPY.open}
      </a>
    </motion.section>
  );
}
