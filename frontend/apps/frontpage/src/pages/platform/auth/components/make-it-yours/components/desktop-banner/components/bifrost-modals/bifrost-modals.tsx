import { Box } from '@onefootprint/ui';

import BifrostImage from '../bifrost-image';
import animationVariants from './animation-variants';

const screens = [
  {
    url: '/auth/make-it-yours/bifrost-1.png',
    height: 416,
    width: 400,
    zIndex: 1,
    variants: animationVariants.left,
  },
  {
    url: '/auth/make-it-yours/bifrost-2.png',
    height: 449,
    width: 400,
    zIndex: 2,
    variants: animationVariants.center,
  },
  {
    url: '/auth/make-it-yours/bifrost-3.png',
    height: 416,
    width: 400,
    zIndex: 1,
    variants: animationVariants.right,
  },
];

const BifrostModals = ({ className }: { className?: string }) => (
  <Box className={className} width="100%" height="100%">
    {screens.map(({ url, variants, height, width, zIndex }) => (
      <BifrostImage key={url} src={url} variants={variants} height={height} width={width} $zIndex={zIndex} />
    ))}
  </Box>
);

export default BifrostModals;
