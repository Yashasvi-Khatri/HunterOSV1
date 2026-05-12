"use client";

interface HunterOSLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function HunterOSLogo({
  size = 32,
  showText = true,
  className = "",
}: HunterOSLogoProps) {
  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      style={{ userSelect: "none" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer hexagon — target/scope ring */}
        <polygon
          points="32,4 56,18 56,46 32,60 8,46 8,18"
          fill="none"
          stroke="#4a7c59"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Inner hexagon — tighter ring */}
        <polygon
          points="32,13 49,22.5 49,41.5 32,51 15,41.5 15,22.5"
          fill="none"
          stroke="#4a7c59"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeOpacity="0.5"
        />

        {/* Crosshair horizontal */}
        <line
          x1="4"
          y1="32"
          x2="24"
          y2="32"
          stroke="#4a7c59"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="32"
          x2="60"
          y2="32"
          stroke="#4a7c59"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Crosshair vertical */}
        <line
          x1="32"
          y1="4"
          x2="32"
          y2="22"
          stroke="#4a7c59"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="32"
          y1="42"
          x2="32"
          y2="60"
          stroke="#4a7c59"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx="32" cy="32" r="3.5" fill="#4a7c59" />

        {/* Corner tick marks — top left */}
        <path
          d="M10 20 L10 14 L16 14"
          fill="none"
          stroke="#7ec89a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Corner tick marks — top right */}
        <path
          d="M54 20 L54 14 L48 14"
          fill="none"
          stroke="#7ec89a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Corner tick marks — bottom left */}
        <path
          d="M10 44 L10 50 L16 50"
          fill="none"
          stroke="#7ec89a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Corner tick marks — bottom right */}
        <path
          d="M54 44 L54 50 L48 50"
          fill="none"
          stroke="#7ec89a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* H letter — center left */}
        <path
          d="M24 26 L24 38 M24 32 L28 32 M28 26 L28 38"
          fill="none"
          stroke="#f5f0e8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* O letter — center */}
        <ellipse
          cx="35"
          cy="32"
          rx="3.5"
          ry="5"
          fill="none"
          stroke="#f5f0e8"
          strokeWidth="1.8"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            style={{
              fontSize: size * 0.44,
              fontWeight: 700,
              color: "#f5f0e8",
              letterSpacing: "0.08em",
              fontFamily: "var(--font-sans)",
            }}
          >
            HunterOS
          </span>
          <span
            style={{
              fontSize: size * 0.22,
              color: "#4a7c59",
              letterSpacing: "0.12em",
              marginTop: 1,
              fontFamily: "var(--font-sans)",
            }}
          >
            BOUNTY INTELLIGENCE
          </span>
        </div>
      )}
    </div>
  );
}
