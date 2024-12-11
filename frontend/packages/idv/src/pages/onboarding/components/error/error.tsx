import { IcoForbid40 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { getLogger } from '@/idv/utils';
import { useRequestError } from '@onefootprint/request';
import { useEffect } from 'react';
import { NavigationHeader } from '../../../../components/layout';

type ErrorComponentProps = {
  error?: unknown;
};

const ErrorComponent = ({ error }: ErrorComponentProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'onboarding.components.error',
  });
  const { getErrorCode } = useRequestError();
  const isBusinessNotOwnedByUserErr = getErrorCode(error) === 'E124';
  const { logError } = getLogger({ location: 'onboarding-components-error' });

  useEffect(() => {
    logError('ErrorComponent', { error });
  }, []);

  return (
    <Container>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: false }} />
      <TitleContainer>
        <IcoForbid40 color="error" />
        <Text variant="heading-3">{t('title')}</Text>
      </TitleContainer>
      <Text variant="body-2" textAlign="center">
        {isBusinessNotOwnedByUserErr ? t('description-business-not-owned-by-user') : t('description')}
      </Text>
    </Container>
  );
};

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
    justify-content: center;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
    min-height: var(--loading-container-min-height);
  `}
`;

export default ErrorComponent;
