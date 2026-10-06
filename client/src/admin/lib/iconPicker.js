/** Copy of the Hugeicons picker (`components/IconPicker.jsx`), shared by every editor that picks an icon. */
export const ICON_PICKER_COPY = {
  button: (name) => (name ? `Change icon (${name})` : 'Choose an icon'),
  search: 'Search icons, e.g. pen, code, users',
  empty: 'No icons match your search.',
  loading: 'Loading icons…',
  loadError: 'Could not load the icons. Close and try again.',
  more: (shown, total) => `Showing ${shown} of ${total}. Search to find more.`,
};
