import { IcoCheck16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import PopOver from '../pop-over';

const Preview = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.summary.auth',
  });

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
            <Paragraph>
              {t('passkeys-availability')}
              <PopOver
                videoSrc="/auth/passkeys.gif"
                triggerVariants={{
                  variant: 'body-4',
                  color: 'tertiary',
                }}
                label={t('passkeys-more.title')}
                content={t('passkeys-more.content')}
              />
            </Paragraph>
          </div>
        </Topic>
      </div>
    </Container>
  );
};

const Paragraph = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.tertiary};

    button {
      margin-left: ${theme.spacing[2]};
    }
  `}
`;

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
