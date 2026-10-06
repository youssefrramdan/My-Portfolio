import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import Contact from '@/features/contact/Contact';
import Education from '@/features/education/Education';
import Hero from '@/features/hero/Hero';
import Projects from '@/features/projects/Projects';
import Skills from '@/features/skills/Skills';
import Testimonials from '@/features/testimonials/Testimonials';
import { useLinkedSection } from '@/lib/useLinkedSection';
import { usePageScroll } from '@/lib/usePageScroll';
import { useNavLinks } from '@/lib/useRenderedSections';
import { cn } from '@/lib/utils';
import { usePageLayout } from './usePageLayout';

/** Page layout key -> section. A section that is not listed is never mounted, so it requests nothing. */
const SECTIONS = {
  hero: Hero,
  skills: Skills,
  projects: Projects,
  education: Education,
  testimonials: Testimonials,
  contact: Contact,
};

const DEFAULT_ORDER = Object.keys(SECTIONS);

/**
 * Home: the visible sections in the saved order (`/api/page`). If the layout cannot be loaded, every section
 * renders in the default order. The hero leaves room for the fixed navbar itself; any other first section
 * gets a navbar-high offset instead. `covered` = a project is open on top: the page and footer are inert, the
 * navbar stays usable (its links close the project).
 */
export default function HomePage({ covered = false }) {
  const { data, isPending, isError } = usePageLayout();
  const links = useNavLinks();
  usePageScroll('/');
  useLinkedSection();
  const keys = (isError ? DEFAULT_ORDER : (data?.sections ?? [])).filter((key) => SECTIONS[key]);

  return (
    <>
      <Navbar links={links} />
      <main
        inert={covered}
        aria-busy={isPending || undefined}
        className={cn('min-h-dvh', keys.length && keys[0] !== 'hero' && 'pt-24')}
      >
        {keys.map((key) => {
          const Section = SECTIONS[key];
          return <Section key={key} />;
        })}
      </main>
      <Footer links={links} inert={covered} />
    </>
  );
}
