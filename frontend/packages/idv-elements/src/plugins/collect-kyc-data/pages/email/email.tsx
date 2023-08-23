import { IdDI } from '@onefootprint/types';
import React from 'react';

import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import EmailCollect from './components/email-collect';

type EmailProps = {
  onComplete?: () => void;
  onCancel?: () => void;
  ctaLabel?: string;
  hideHeader?: boolean;
};

const Email = ({ onComplete, onCancel, ctaLabel, hideHeader }: EmailProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { authToken } = state.context;

  const handleSubmit = (submittedEmail: string) => {
    send({
      type: 'dataSubmitted',
      payload: {
        [IdDI.email]: { value: submittedEmail },
      },
    });
    onComplete?.();
  };

  return (
    <EmailCollect
      authToken={authToken}
      onComplete={handleSubmit}
      onCancel={onCancel}
      ctaLabel={ctaLabel}
      hideHeader={hideHeader}
    />
  );
};

export default Email;
