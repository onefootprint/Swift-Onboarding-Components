import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const Preview = () => {
  const { t } = useTranslation('pages.playbooks.dialog.summary.auth');

  return (
    <Container>
      <div>
        <MarginBottom>
          <Typography variant="label-3" color="primary">
            {t('signup')}
          </Typography>
          <Typography variant="body-4" color="secondary">
            {t('signup-method')}
          </Typography>
        </MarginBottom>

        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <Typography variant="body-4" color="primary">
            {t('names')}
          </Typography>
        </Topic>

        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <div>
            <Typography variant="body-4" color="primary">
              {t('email')}
            </Typography>
            <Typography variant="body-4" color="tertiary">
              {t('email-validation-method')}
            </Typography>
          </div>
        </Topic>
        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <div>
            <Typography variant="body-4" color="primary">
              {t('phone-number')}
            </Typography>
            <Typography variant="body-4" color="tertiary">
              {t('sms-validation-method')}
            </Typography>
          </div>
        </Topic>
      </div>

      <div>
        <MarginBottom>
          <Typography variant="label-3" color="primary">
            {t('signin')}
          </Typography>
          <Typography variant="body-4" color="secondary">
            {t('signin-method')}
          </Typography>
        </MarginBottom>

        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <Typography variant="body-4" color="primary">
            {t('code-sending')}
          </Typography>
        </Topic>
        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <div>
            <Typography variant="body-4" color="primary">
              {t('passkeys')}
            </Typography>
            <Typography variant="body-4" color="tertiary">
              {t('passkeys-availability')} {t('passkeys-more')}
            </Typography>
          </div>
        </Topic>
      </div>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

const MarginBottom = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: ${theme.spacing[4]};
  `}
`;

const Topic = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[4]};
    align-content: center;
    .icon {
      flex-shrink: 0;
    }
  `}
`;

export default Preview;
