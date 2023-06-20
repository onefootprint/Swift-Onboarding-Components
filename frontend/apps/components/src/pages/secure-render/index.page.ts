import dynamic from 'next/dynamic';

const SecureRender = dynamic(() => import('./secure-render'), { ssr: false });

export default SecureRender;
