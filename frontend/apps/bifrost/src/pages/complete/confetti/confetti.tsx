import Lottie from 'lottie-react';
import React, { useEffect } from 'react';

import { BIFROST_CONTAINER_ID } from '../../../components/layout';
import LottieFile from './confetti-lottie.json';

let height: number | undefined;
let width: number | undefined;

const ConfettiAnimation = () => {
  useEffect(() => {
    const container = document.getElementById(BIFROST_CONTAINER_ID);
    height = container?.offsetHeight;
    width = container?.offsetWidth;
  }, []);

  return (
    <Lottie
      animationData={LottieFile}
      loop={false}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: `${height}`,
        width: `${width}`,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ConfettiAnimation;
