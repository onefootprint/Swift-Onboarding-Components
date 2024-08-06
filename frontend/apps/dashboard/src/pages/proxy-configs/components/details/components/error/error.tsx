import { IcoForbid40 } from '@onefootprint/icons';
import { EmptyState } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type ErrorProps = {
  message: string;
};

const ErrorComponent = ({ message }: ErrorProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });

  return (
    <ErrorContainer>
      <EmptyState description={message} iconComponent={IcoForbid40} title={t('error')} />
    </ErrorContainer>
  );
};

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

export default ErrorComponent;
