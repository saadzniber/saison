interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 56 }: LogoMarkProps) {
  const r = size * 0.286; // corner radius ≈ 16/56 of size
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="56" height="56" rx={r} fill="#2D5016" />

      {/* Leaf body */}
      <path
        d="M28 11 C28 11 16 19 16 29 C16 36.18 21.37 42 28 42 C34.63 42 40 36.18 40 29 C40 19 28 11 28 11 Z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Center vein */}
      <path
        d="M28 40 L28 17"
        stroke="#2D5016"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Left vein */}
      <path
        d="M28 31 C25 28 21 27 20 25"
        stroke="#2D5016"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />

      {/* Right vein */}
      <path
        d="M28 31 C31 28 35 27 36 25"
        stroke="#2D5016"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
    </svg>
  );
}
