const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  'aria-hidden': true,
  focusable: 'false',
};

export const HomeIcon = (p) => (
  <svg {...base} {...p}><path d="M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10" /></svg>
);
export const ListIcon = (p) => (
  <svg {...base} {...p}><path d="M4 6h2M10 6h10M4 12h2M10 12h10M4 18h2M10 18h10" /></svg>
);
export const UserIcon = (p) => (
  <svg {...base} {...p}><path d="M9 5h6v6H9zM5 21v-4h14v4" /></svg>
);
export const LockIcon = (p) => (
  <svg {...base} {...p}><path d="M6 11h12v9H6zM8 11V7h8v4" /></svg>
);
export const CheckIcon = (p) => (
  <svg {...base} {...p}><path d="m5 12 5 5 9-10" /></svg>
);
export const CrossIcon = (p) => (
  <svg {...base} {...p}><path d="m6 6 12 12M18 6 6 18" /></svg>
);
export const LogoutIcon = (p) => (
  <svg {...base} {...p}><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" /></svg>
);
