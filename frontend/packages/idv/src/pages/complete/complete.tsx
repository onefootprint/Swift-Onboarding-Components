import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import styled from '@onefootprint/styled';
import { Box, LinkButton, LoadingIndicator } from '@onefootprint/ui';
import React from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';
import useIsKyb from './hooks/use-is-kyb';

const Complete = () => {
  const { t } = useTranslation('pages.complete');
  const [state] = useIdvMachine();
  const { isLoading, isKyb } = useIsKyb();
  const { onClose } = state.context;

  return (
    <Container>
      <NavigationHeader leftButton={{ variant: 'close' }} />
      {isLoading ? (
        <LoadingContainer>
          <LoadingIndicator />
        </LoadingContainer>
      ) : (
        <>
          <IcoCheckCircle40 color="success" />
          <Box marginBottom={4} />
          <HeaderTitle
            sx={{ display: 'flex', flexDirection: 'column', gap: 4, zIndex: 3 }}
            title={t('title')}
            subtitle={isKyb ? t('subtitle-with-kyb') : t('subtitle')}
          />
          <Box />
          {onClose && (
            <LinkButton sx={{ marginTop: 7 }} onClick={onClose}>
              {t('cta')}
            </LinkButton>
          )}
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  width: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  position: relative;
`;

const LoadingContainer = styled.div`
  height: 100%;
  width: 100%;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Complete;
