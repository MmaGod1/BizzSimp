import Link from "next/link";

export function Logo() {
  return (
    <Link className="brand" href="/" aria-label="BizzSimp home">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width="40"
        height="40"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill="#F2B84B" />
        <path
          d="M16 12h32a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H37l-9 10v-10H16a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z"
          fill="#1E3A5F"
        />
        <path
          d="M19 38l8-8 6 5 11-12"
          fill="none"
          stroke="#F2B84B"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37 23h7v7"
          fill="none"
          stroke="#F2B84B"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="brand-copy">
        <span className="brand-name">BizzSimp</span>
        <span className="brand-tagline">Your sales, made simple</span>
      </span>
    </Link>
  );
}
