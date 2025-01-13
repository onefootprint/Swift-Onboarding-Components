import Head from 'next/head';
import { useState } from 'react';

import CredsForm from './components/creds-form';
import DemoForm from './components/demo-form';

const SecureFormDemo = () => {
  const [authToken, setAuthToken] = useState<string>();

  return (
    <div className="grid grid-cols-1 grid-rows-[120px_1fr_120px] align-middle w-full h-screen bg-secondary place-items-center">
      <Head>
        <title>Footprint Form Demo</title>
      </Head>
      <h2 className="mb-2 text-heading-2">Secure Form Demo</h2>
      {authToken ? <DemoForm authToken={authToken} /> : <CredsForm onSubmit={setAuthToken} />}
    </div>
  );
};

export default SecureFormDemo;
