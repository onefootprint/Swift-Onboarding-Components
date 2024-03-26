import { useFootprint } from '@onefootprint/components';
import React, { useEffect } from 'react';

const PasskeysAndDocs = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();

  useEffect(() => {
    fp.handoff({
      onSuccess: validationToken => {
        alert(validationToken);
        onDone();
      },
    });
  }, []);

  return (
    <div>
      <h1>Passkeys and Docs</h1>
      <p>Continue on the window</p>
    </div>
  );
};

export default PasskeysAndDocs;
