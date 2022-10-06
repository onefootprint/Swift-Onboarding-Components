import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { EmptyState } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

type SignalDetailsErrorProps = {
  message: string;
};

const SignalDetailsError = ({ message }: SignalDetailsErrorProps) => {
  const { t } = useTranslation('notifications');
  return (
    <SignalDetailsErrorContainer>
      <EmptyState
        description={message}
        iconComponent={IcoForbid40}
        title={t('error')}
      />
    </SignalDetailsErrorContainer>
  );
};

const SignalDetailsErrorContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

export default SignalDetailsError;
