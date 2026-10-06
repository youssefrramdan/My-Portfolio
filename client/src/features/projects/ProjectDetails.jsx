import Chip from '@/components/ui/Chip';
import { cn } from '@/lib/utils';
import ProjectGallery from './ProjectGallery';

/**
 * Project page content (Figma 549:18363): title, summary, facts (year · role · client) and tags, then the gallery.
 * Shared by the home overlay, the standalone page and the dashboard preview. `titleRef` lets the overlay focus
 * the title when it opens.
 */
export default function ProjectDetails({ project, titleId, titleRef, className }) {
  const facts = [project.year, project.role, project.client].filter(Boolean);
  const tags = project.tags ?? [];

  return (
    <article aria-labelledby={titleId} className={cn('px-grid-margin', className)}>
      <div className="mx-auto w-full max-w-294.25">
        <header className="flex flex-col gap-4 tablet:gap-6">
          <h1 id={titleId} ref={titleRef} tabIndex={-1} className="text-h3 font-regular text-text-primary outline-none tablet:text-h2 xl:text-h1">
            {project.title}
          </h1>
          {project.description && (
            <p className="max-w-270 text-large whitespace-pre-line text-neutral-text-muted tablet:text-extra-large xl:text-h6">{project.description}</p>
          )}
          {(facts.length > 0 || tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {facts.length > 0 && <p className="text-base text-text-secondary">{facts.join(' · ')}</p>}
              {tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <li key={tag.label} className="flex">
                      <Chip size="sm">{tag.label}</Chip>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </header>

        <ProjectGallery gallery={project.gallery} title={project.title} className="mt-10 xl:mt-16" />
      </div>
    </article>
  );
}
