import { useEffect } from 'react';
import { useSettings } from '@/features/settings/useSettings';
import { applyBrandColor } from '@/lib/brandColor';

/** Keeps the site and the dashboard in the brand color saved in Settings > General. Renders nothing. */
export default function BrandColor() {
  const brandColor = useSettings().data?.brandColor;
  useEffect(() => applyBrandColor(brandColor), [brandColor]);
  return null;
}
