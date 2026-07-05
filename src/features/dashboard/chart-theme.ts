/**
 * Chart color tokens — validated with the dataviz palette validator against
 * the white card surface (all checks pass). If you rebrand, re-validate.
 */
export const CHART = {
  // Ordinal one-hue ramp for the funnel (light → dark = pipeline depth)
  funnelRamp: ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab'],
  won: '#2a78d6',
  lost: '#e34948',
  grid: '#e1e0d9',
  axisText: '#898781',
  baseline: '#c3c2b7'
} as const;

export const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
  fontSize: 12,
  padding: '8px 10px'
};
