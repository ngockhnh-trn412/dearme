"use client";

type DearMeIconProps = {
  size?: number;
  className?: string;
  title?: string;
};

type DearMeLogoProps = DearMeIconProps & {
  wordmarkClassName?: string;
  gap?: number;
};

const PARCHMENT = "#f5e6c8";
const PARCHMENT_EDGE = "#e0d0b0";
const GOLD = "#c9a96e";

export function DearMeIcon({ size = 40, className, title }: DearMeIconProps) {
  const detailed = size >= 56;
  const medium = size >= 32;
  const eyeWidth = size >= 80 ? 1.8 : size >= 40 ? 3.5 : 5;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}

      <ellipse cx="100" cy="118" rx="68" ry="52" fill="currentColor" />
      <path
        d="M 38 105 Q 20 80, 45 65 Q 55 58, 58 68"
        stroke="currentColor"
        strokeWidth={medium ? 14 : 18}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="128" cy="82" rx="34" ry="30" fill="currentColor" />
      <path d="M 104 62 Q 108 40, 118 50" fill="currentColor" />
      <path d="M 148 55 Q 155 34, 158 52" fill="currentColor" />
      {medium ? (
        <ellipse
          cx="145"
          cy="130"
          rx="14"
          ry="8"
          fill="currentColor"
          transform="rotate(-10, 145, 130)"
        />
      ) : null}

      <path
        d="M 116 80 Q 120 76, 124 80"
        stroke={GOLD}
        strokeWidth={eyeWidth}
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      <path
        d="M 132 78 Q 136 74, 140 78"
        stroke={GOLD}
        strokeWidth={eyeWidth}
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      {medium ? (
        <ellipse cx="130" cy="86" rx="3" ry="2" fill={GOLD} opacity="0.35" />
      ) : null}

      {detailed ? (
        <>
          <path
            d="M 128 88 Q 130 90, 132 88"
            stroke={GOLD}
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.2"
          />
          <line x1="115" y1="84" x2="106" y2="82" stroke={GOLD} strokeWidth="0.8" opacity="0.15" />
          <line x1="115" y1="86" x2="105" y2="87" stroke={GOLD} strokeWidth="0.8" opacity="0.15" />
          <line x1="143" y1="83" x2="152" y2="81" stroke={GOLD} strokeWidth="0.8" opacity="0.15" />
          <line x1="143" y1="85" x2="153" y2="86" stroke={GOLD} strokeWidth="0.8" opacity="0.15" />
        </>
      ) : null}

      {medium ? (
        <rect
          x="72"
          y="126"
          width="32"
          height="22"
          rx="2"
          fill={PARCHMENT}
          opacity="0.85"
          transform="rotate(-6, 88, 137)"
        />
      ) : null}
      {detailed ? (
        <path
          d="M 73 128 L 88 138 L 103 128"
          stroke={PARCHMENT_EDGE}
          strokeWidth="1"
          fill="none"
          opacity="0.5"
          transform="rotate(-6, 88, 133)"
        />
      ) : null}
      <circle
        cx="88"
        cy={medium ? 140 : 138}
        r={medium ? 5.5 : 8}
        fill={GOLD}
        opacity={medium ? 0.7 : 0.9}
      />
      {detailed ? (
        <circle
          cx="88"
          cy="140"
          r="3.2"
          stroke={PARCHMENT}
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
        />
      ) : null}
    </svg>
  );
}

export function DearMeLogo({
  size = 44,
  gap = 16,
  className,
  wordmarkClassName,
  title = "Dear Me",
}: DearMeLogoProps) {
  return (
    <span className={`inline-flex items-center ${className ?? ""}`} style={{ gap }}>
      <DearMeIcon size={size} title={title} />
      <span
        className={
          wordmarkClassName ??
          "font-serif italic tracking-wide text-[#f5e6c8]"
        }
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        Dear Me
      </span>
    </span>
  );
}

export default DearMeLogo;