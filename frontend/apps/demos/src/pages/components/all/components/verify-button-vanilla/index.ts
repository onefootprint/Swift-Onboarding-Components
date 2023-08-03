import dynamic from 'next/dynamic';

const VerifyButtonVanilla = dynamic(() => import('./verify-button-vanilla'), {
  ssr: false,
});

export default VerifyButtonVanilla;
