/** Small aside card of an editor (Figma: item name + "This editor autosaves…"). */
export default function EditorHint({ title, text }) {
  return (
    <div className="rounded-card bg-neutral-surface-0 p-5">
      <p className="truncate text-extra-small font-semi-bold text-neutral-text-heading">{title}</p>
      <p className="mt-1 text-extra-small text-neutral-text-label">{text}</p>
    </div>
  );
}
