import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';
import SSN from '../ssn';

const EditIdentityDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKycDataMachine();

  const handlePrev = () => {
    send({ type: Events.returnToSummary });
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'back', onClick: handlePrev }}>
        <Typography variant="label-2">
          {t('edit-sheet.title', { name: t('identity.title').toLowerCase() })}
        </Typography>
      </NavigationHeader>
      <Container>
        <SSN
          ctaLabel={t('edit-sheet.save')}
          onComplete={handlePrev}
          hideDisclaimer
          hideTitle
          hideNavHeader
        />
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]}px;
    border-top: 1px solid ${theme.borderColor.tertiary};
  `};
`;

export default EditIdentityDesktop;
