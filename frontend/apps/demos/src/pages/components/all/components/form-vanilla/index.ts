import dynamic from 'next/dynamic';

const Vanilla = dynamic(() => import('./form-vanilla'), {
  ssr: false,
});

export default Vanilla;
