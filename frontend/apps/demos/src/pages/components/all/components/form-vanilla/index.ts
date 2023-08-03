import dynamic from 'next/dynamic';

const FormVanilla = dynamic(() => import('./form-vanilla'), {
  ssr: false,
});

export default FormVanilla;
