import React from 'react';

import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import EmailCollect from './components/email-collect';

type EmailProps = {
  onComplete?: () => void;
  ctaLabel?: string;
  hideHeader?: boolean;
};

const Email = ({ onComplete, ctaLabel, hideHeader }: EmailProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { authToken, config } = state.context;

  const handleSubmit = (submittedEmail?: string) => {
    send({
      type: 'emailSubmitted',
      payload: {
        email: submittedEmail,
      },
    });
    onComplete?.();
  };

  return (
    <EmailCollect
      authToken={authToken}
      onComplete={handleSubmit}
      ctaLabel={ctaLabel}
      config={config}
      hideHeader={hideHeader}
    />
  );
};

export default Email;
