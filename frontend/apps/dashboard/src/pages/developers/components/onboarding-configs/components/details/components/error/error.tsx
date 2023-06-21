import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import { EmptyState } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  message: string;
};

const Error = ({ message }: ErrorProps) => {
  const { t } = useTranslation('notifications');
  return (
    <ErrorContainer>
      <EmptyState
        description={message}
        iconComponent={IcoForbid40}
        title={t('error')}
      />
    </ErrorContainer>
  );
};

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

export default Error;
