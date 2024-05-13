import { useFootprint } from '@onefootprint/elements';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PasskeysAndDocs = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();
  useEffectOnce(() => {
    fp.handoff();
  });

  return (
    <div>
      <h1>Passkeys and Docs</h1>
      <p>Continue on the window</p>
    </div>
  );
};

export default PasskeysAndDocs;
