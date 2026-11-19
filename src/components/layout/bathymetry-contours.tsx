interface BathymetryContoursProps {
  className?: string;
}

export function BathymetryContours({ className = "" }: BathymetryContoursProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 220"
      preserveAspectRatio="none"
      className={`pointer-events-none select-none ${className}`}
    >
      <path
        d="M0,45 C180,75 340,25 560,65 C790,105 980,40 1200,80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M0,95 C220,125 410,60 640,105 C850,145 1030,85 1200,120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M0,150 C250,175 460,115 700,155 C910,190 1070,135 1200,165"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <path
        d="M0,195 C280,210 510,165 760,198 C960,215 1090,180 1200,202"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
      />
    </svg>
  );
}
