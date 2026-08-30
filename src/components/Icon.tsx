const paths: Record<string, string> = {
  flame: "M12 3c2 3.5-1 4.5-1 7a3 3 0 0 0 6 0c0-1 .3-2 .8-2.7C19 9.5 20 11.6 20 13.6 20 17.7 16.4 21 12 21S4 17.7 4 13.6C4 8.8 9 7.6 12 3Z",
  tree: "M12 3 6 12h3l-3 5h5v4h2v-4h5l-3-5h3L12 3Z",
  spark: "M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2",
  star: "M12 3.5l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.9l6.1-.8L12 3.5Z",
  cup: "M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8ZM16 9h2a3 3 0 0 1 0 6h-2M3 22h14",
  water: "M4 15c2.5 0 3.5-2 6-2s3.5 2 6 2 3-1.4 4-1.4M4 19c2.5 0 3.5-2 6-2s3.5 2 6 2 3-1.4 4-1.4M12 3c2.5 3 4 5.2 4 7a4 4 0 0 1-8 0c0-1.8 1.5-4 4-7Z",
  shop: "M4 9h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9ZM3 9l2-5h14l2 5M10 21v-6h4v6",
  car: "M5 16v3M19 16v3M3 13l2-6h14l2 6v3H3v-3ZM6.5 16h.01M17.5 16h.01",
};

export default function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={paths[name] ?? paths.tree} />
    </svg>
  );
}
