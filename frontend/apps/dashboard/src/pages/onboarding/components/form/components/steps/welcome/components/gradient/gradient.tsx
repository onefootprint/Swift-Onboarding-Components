import React from 'react';

import Blob from './components/blob';

const Gradient = () => (
  <>
    <Blob
      color="#f39b75"
      width={50}
      height={50}
      top={0}
      left={26}
      mixBlendMode="overlay"
    />
    <Blob
      color="#C8E4FF"
      width={406}
      height={368}
      top={-316}
      left={107}
      mixBlendMode="overlay"
    />
    <Blob
      color="#c2ff40"
      width={50}
      height={50}
      top={50}
      left={100}
      mixBlendMode="overlay"
    />
  </>
);

export default Gradient;
