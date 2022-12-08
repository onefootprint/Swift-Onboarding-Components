import React from 'react';

import Blob from './components/blob';

// TODO: FP-2135
// https://linear.app/footprint/issue/FP-2135/create-gradient-in-the-welcome-step
const Gradient = () => (
  <>
    <Blob color="#F6D1C1" width={476} height={312} top={-133} left={-190} />
    <Blob color="#C8E4FF" width={406} height={368} top={-316} left={107} />
    <Blob color="#E5F6C1" width={711} height={515} top={2.89} left={276} />
    <Blob color="#F6E7C1" width={645} height={604} top={24} left={510} />
    <Blob color="#76FBDB" width={564} height={607} top={-224} left={632} />
  </>
);

export default Gradient;
