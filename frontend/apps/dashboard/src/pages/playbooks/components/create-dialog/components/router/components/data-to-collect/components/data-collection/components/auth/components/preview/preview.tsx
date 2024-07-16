import { IcoCheck16 } from '@onefootprint/icons';
import { Text, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import PopOver from '../pop-over';

const Preview = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.auth',
  });

  return (
    <Container>
      <div>
        <MarginBottom>
          <Text variant="label-3" color="primary">
            {t('signup')}
          </Text>
          <Text variant="body-4" color="secondary">
            {t('signup-method')}
          </Text>
        </MarginBottom>

        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <div>
            <Text variant="body-4" color="primary">
              {t('email')}
            </Text>
            <Text variant="body-4" color="tertiary">
              {t('email-validation-method')}
            </Text>
          </div>
        </Topic>
        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <div>
            <Text variant="body-4" color="primary">
              {t('phone-number')}
            </Text>
            <Text variant="body-4" color="tertiary">
              {t('sms-validation-method')}
            </Text>
          </div>
        </Topic>
      </div>

      <div>
        <MarginBottom>
          <Text variant="label-3" color="primary">
            {t('signin')}
          </Text>
          <Text variant="body-4" color="secondary">
            {t('signin-method')}
          </Text>
        </MarginBottom>

        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <Text variant="body-4" color="primary">
            {t('code-sending')}
          </Text>
        </Topic>
        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <div>
            <Text variant="body-4" color="primary">
              {t('passkeys')}
            </Text>
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
