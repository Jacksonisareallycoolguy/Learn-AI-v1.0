export default function PixelBrain({ className = '' }) {
  return (
    <img
      src="/brain.png"
      alt="Pink pixel-art brain with cyan connections"
      className={`pixel-brain ${className}`}
      style={{
        maxWidth: '100%',
        height: 'auto',
        imageRendering: 'pixelated',
      }}
    />
  );
}
