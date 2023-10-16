import dynamic from 'next/dynamic';

export type { FormBaseProps, FormData } from './form-base';

const FormBase = dynamic(() => import('./form-base'), {
  loading: () => null,
});

export default FormBase;
