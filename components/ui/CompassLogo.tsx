'use client';

interface CompassLogoProps {
  size?: number;
  className?: string;
}

export default function CompassLogo({ size = 40, className = '' }: CompassLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Slot Compass logo"
      role="img"
    >
      {/* Outer ring */}
      <circle cx="40" cy="40" r="38" stroke="#c9962a" strokeWidth="1.5" fill="#111111" />
      <circle cx="40" cy="40" r="34" stroke="#c9962a" strokeWidth="0.5" fill="none" opacity="0.4" />

      {/* Cardinal tick marks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const isCardinal = angle % 90 === 0;
        const r1 = isCardinal ? 34 : 36;
        const r2 = isCardinal ? 30 : 33;
        return (
          <line
            key={angle}
            x1={40 + r1 * Math.sin(rad)}
            y1={40 - r1 * Math.cos(rad)}
            x2={40 + r2 * Math.sin(rad)}
            y2={40 - r2 * Math.cos(rad)}
            stroke="#c9962a"
            strokeWidth={isCardinal ? 1.5 : 0.8}
            opacity={isCardinal ? 0.9 : 0.5}
          />
        );
      })}

      {/* N E S W labels */}
      <text x="40" y="12" textAnchor="middle" fill="#c9962a" fontSize="7" fontWeight="700" fontFamily="serif">N</text>
      <text x="68" y="44" textAnchor="middle" fill="#c9962a" fontSize="6" fontFamily="serif">E</text>
      <text x="40" y="73" textAnchor="middle" fill="#c9962a" fontSize="6" fontFamily="serif">S</text>
      <text x="12" y="44" textAnchor="middle" fill="#c9962a" fontSize="6" fontFamily="serif">W</text>

      {/* North needle (gold) */}
      <polygon
        points="40,14 43,42 40,38 37,42"
        fill="#c9962a"
        stroke="#b8860b"
        strokeWidth="0.5"
      />
      {/* South needle (dark) */}
      <polygon
        points="40,66 37,38 40,42 43,38"
        fill="#3a3020"
        stroke="#c9962a"
        strokeWidth="0.5"
      />

      {/* Center jewel */}
      <circle cx="40" cy="40" r="3.5" fill="#c9962a" />
      <circle cx="40" cy="40" r="2" fill="#e8c64a" />
      <circle cx="40" cy="40" r="1" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}
