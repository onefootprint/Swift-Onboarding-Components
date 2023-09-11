import type { FootprintRenderProps } from '@onefootprint/footprint-js';

export type FootprintRenderDataProps = Omit<
  FootprintRenderProps,
  'kind' | 'appearance'
>;
