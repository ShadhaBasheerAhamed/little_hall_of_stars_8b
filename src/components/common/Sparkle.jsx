// A four-point sparkle used as the "star" throughout the design.
export const SPARKLE_PATH = 'M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z';

export default function Sparkle({ className = '', style, title }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} aria-label={title}>
      <path fill="currentColor" d={SPARKLE_PATH} />
    </svg>
  );
}
