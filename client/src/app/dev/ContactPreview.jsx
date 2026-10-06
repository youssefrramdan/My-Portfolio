import { useSearchParams } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import Contact from '@/features/contact/Contact';
import { cn } from '@/lib/utils';

// TODO: delete with the /contact-preview route.
const PLATFORMS = ['whatsapp', 'x', 'discord', 'github', 'linkedin', 'telegram', 'instagram', 'behance'];
const COUNTS = Array.from({ length: PLATFORMS.length + 1 }, (_, count) => count);

/** Dev-only: Contact + Footer with 0..8 socials (`?count=n`) to check the arc distribution. */
export default function ContactPreview() {
  const [params, setParams] = useSearchParams();
  const count = Math.min(Math.max(Number(params.get('count') ?? PLATFORMS.length) || 0, 0), PLATFORMS.length);
  const socials = PLATFORMS.slice(0, count).map((platform) => ({ platform, url: `https://example.com/${platform}` }));

  return (
    <div className="min-h-dvh pt-40">
      <div className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center gap-2 bg-bg-primary/80 p-3 backdrop-blur-glass">
        <span className="text-small text-text-secondary">Socials:</span>
        {COUNTS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setParams({ count: String(value) })}
            className={cn(
              'size-8 rounded-full text-small',
              value === count ? 'bg-fill-primary text-on-brand' : 'bg-neutral-surface-2 text-text-primary',
            )}
          >
            {value}
          </button>
        ))}
      </div>
      <Contact key={count} socials={socials} />
      <Footer />
    </div>
  );
}
