import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { IconButton, Typography } from '@onefootprint/ui';
import React from 'react';

type InvalidProps = {
  onClose?: () => void;
};

const Invalid = ({ onClose }: InvalidProps) => {
  const { t } = useTranslation('pages.secure-form.invalid');

  return (
    <Container id="footprint-container">
      {onClose && (
        <CloseContainer>
          <CloseButton>
            <IconButton aria-label={t('close-aria-label')} onClick={onClose}>
              <IcoClose24 />
            </IconButton>
          </CloseButton>
        </CloseContainer>
      )}
      <Typography as="h2" color="primary" variant="heading-3">
        {t('title')}
      </Typography>
      <Typography
        variant="body-2"
        color="secondary"
        as="h3"
        sx={{ marginTop: 3, marginBottom: 7 }}
      >
        {t('subtitle')}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    justify-content: stretch;
    text-align: center;
    padding: ${theme.spacing[7]};
    width: 100%;
    max-width: 600px;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const CloseButton = styled.div`
  position: absolute;
  left: 0;
`;

const CloseContainer = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    width: 100%;
    padding: ${theme.spacing[4]};
    position: sticky;
    z-index: 1;
    top: 0;
    justify-content: center;
  `}
`;

export default Invalid;
