import { motion } from 'framer-motion';
import Avatar from '@/components/ui/Avatar';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import QuoteMark from './QuoteMark';

/**
 * Figma "Comments" card: quote mark, message, then a divider over the avatar (photo, else initial), name and role.
 * The footer sits at the bottom so cards stretched to the tallest one in the row line up.
 */
export default function TestimonialCard({ testimonial, className, ...props }) {
  const { name, role, message, avatar } = testimonial;

  return (
    <motion.figure
      className={cn(
        'flex w-75 shrink-0 flex-col rounded-card bg-neutral-surface-0 px-6 pb-6 tablet:w-104',
        className,
      )}
      {...props}
    >
      <QuoteMark className="mt-7.75 ml-0.5 w-13.75 shrink-0 text-text-brand opacity-30 tablet:mt-17.75" />
      <blockquote className="mt-5 text-base font-medium text-text-primary tablet:mt-3">
        <p>{message}</p>
      </blockquote>
      <div className="mt-auto pt-6 tablet:pt-15.5">
        <figcaption className="flex items-center gap-4 border-t border-neutral-gray/50 py-4">
          {avatar?.url ? (
            <img
              src={cldUrl(avatar.url, { width: 140 })}
              alt=""
              loading="lazy"
              className="size-17.5 shrink-0 rounded-full object-cover"
            />
          ) : (
            <Avatar name={name} />
          )}
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-large font-semi-bold text-text-primary">{name}</span>
            <span className="text-small text-text-secondary tablet:text-base">{role}</span>
          </span>
        </figcaption>
      </div>
    </motion.figure>
  );
}
