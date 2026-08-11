interface ApplicationBadgeProps {
  readonly accent: string
  readonly detail: string
}

export function ApplicationBadge({ accent, detail }: ApplicationBadgeProps) {
  return (
    <span className="application-badge" aria-hidden="true">
      <svg viewBox="0 0 40 40" focusable="false">
        <rect width="40" height="40" rx="12" fill={accent} />
        <path
          d="M12 8.5h11.4L29 14.1v17.4H12z"
          fill="#fffaf6"
          stroke="#ffffff"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path d="M23.4 8.5v5.6H29" fill="#ffd8bd" stroke="#ffffff" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="m15.8 23.1 3.1 3.1 6.7-7" fill="none" stroke={detail} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
        <circle cx="31.5" cy="8.5" r="3.25" fill="#ffffff" />
        <circle cx="31.5" cy="8.5" r="1.35" fill={detail} />
      </svg>
    </span>
  )
}
