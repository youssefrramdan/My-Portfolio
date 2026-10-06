import { Briefcase, FileText, Image, MessageSquareText, Zap } from 'lucide-react';

export const WORK_PATH = '/admin/content/work';
export const CAPABILITIES_PATH = '/admin/content/capabilities';
export const CREDENTIALS_PATH = '/admin/content/credentials';
export const TESTIMONIALS_PATH = '/admin/content/testimonials';
export const CONTACT_PATH = '/admin/content/contact';
export const PAGE_PATH = '/admin/page';
export const MEDIA_PATH = '/admin/media';

/** Content library tiles (Overview and Content). `key` reads `overview.counts`, `media` reads `overview.media.count`. */
export const CONTENT_TILES = [
  { key: 'work', label: 'Work', icon: Briefcase, unit: (n) => `${n} ${n === 1 ? 'item' : 'items'}`, to: WORK_PATH },
  { key: 'capabilities', label: 'Capabilities', icon: Zap, unit: (n) => `${n} ${n === 1 ? 'skill' : 'skills'}`, to: CAPABILITIES_PATH },
  { key: 'credentials', label: 'Credentials', icon: FileText, unit: (n) => `${n} ${n === 1 ? 'item' : 'items'}`, to: CREDENTIALS_PATH },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquareText, unit: (n) => `${n} ${n === 1 ? 'quote' : 'quotes'}`, to: TESTIMONIALS_PATH },
  { key: 'media', label: 'Media', icon: Image, unit: (n) => `${n} ${n === 1 ? 'file' : 'files'}`, to: MEDIA_PATH },
];

export const pendingLabel = (n) => `${n} pending`;

/** Count shown on a tile, from the Overview data. */
export const tileCount = (overview, key) => (key === 'media' ? overview.media.count : overview.counts[key]);
