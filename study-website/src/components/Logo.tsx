interface LogoProps {
  className?: string;
  size?: number; // Used for height
  showText?: boolean;
  variant?: 'icon' | 'full';
}

export const Logo = ({ className = '', size = 32, showText = false, variant = 'icon' }: LogoProps) => {
  const logoSrc = variant === 'full' ? '/full-logo.png.png' : '/favicon-32x32.png.png';

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoSrc}
        alt="visdly"
        style={{
          height: `${size}px`,
          width: 'auto', // Allow width to scale naturally
          display: 'block'
        }}
        className="flex-shrink-0"
      />
      {showText && variant !== 'full' && (
        <span className="font-semibold text-lg tracking-tight ml-2">visdly</span>
      )}
    </div>
  );
};

