import dynamic from 'next/dynamic';

const SecureForm = dynamic(() => import('./secure-form'), { ssr: false });

export default SecureForm;
