import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning40 } from '@onefootprint/icons';
import { Button, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import BadImageErrorLabel from '../../constants/bad-image-error-label';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';

const Error = () => {
  const { t } = useTranslation('pages.error');
  const [state, send] = useIdDocMachine();
  const { errors } = state.context.idDoc;
  const handleClick = () => {
    send({
      type: Events.resubmitIdDocImages,
    });
  };
  // In case backend sends us error codes we don't expect
  const cleanedErrors =
    errors?.filter(error => !!BadImageErrorLabel[error]) ?? [];
  const hasErrors = cleanedErrors.length > 0;

  return hasErrors ? (
    <Container>
      <IcoWarning40 color="error" />
      <HeaderTitle title={t('title')} subtitle={t('description-with-errors')} />
      <ErrorsContainer>
        {cleanedErrors.map(error => (
          <Typography key={error} variant="body-2" color="secondary" as="li">
            {BadImageErrorLabel[error]}
          </Typography>
        ))}
      </ErrorsContainer>
      <Button fullWidth onClick={handleClick}>
        {t('cta')}
      </Button>
    </Container>
  ) : (
    <Container>
      <IcoWarning40 color="error" />
      <HeaderTitle title={t('title')} subtitle={t('description')} />
      <Button fullWidth onClick={handleClick}>
        {t('cta')}
      </Button>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[7]};
  `}
`;

const ErrorsContainer = styled.ul`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[5]};

    li {
      list-style-type: disc;
      margin-left: ${theme.spacing[5]};
    }
  `}
`;

export default Error;
