import { IcoCheck16 } from '@onefootprint/icons';
import { Stack, Text, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import PopOver from '../pop-over';

const Preview = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-auth',
  });

  return (
    <Container>
      <Stack flexDirection="column" gap={4}>
        <Header>
          <Text variant="label-3" color="primary">
            {t('title')}
          </Text>
          <Text variant="body-4" color="secondary">
            {t('subtitle')}
          </Text>
        </Header>
        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <div>
            <Text variant="body-4" color="primary">
              {t('sign-up.email.label')}
            </Text>
            <Text variant="body-4" color="tertiary">
              {t('sign-up.email.description')}
            </Text>
          </div>
        </Topic>
        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <div>
            <Text variant="body-4" color="primary">
              {t('sign-up.phone-number.label')}
            </Text>
            <Text variant="body-4" color="tertiary">
              {t('sign-up.phone-number.description')}
            </Text>
          </div>
        </Topic>
      </Stack>
      <Stack flexDirection="column" gap={4}>
        <Header>
          <Text variant="label-3" color="primary">
            {t('sign-in.title')}
          </Text>
          <Text variant="body-4" color="secondary">
            {t('sign-in.subtitle')}
          </Text>
        </Header>
        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <Text variant="body-4" color="primary">
            {t('sign-in.otp.label')}
          </Text>
        </Topic>
        <Topic>
          <IcoCheck16 className="icon" aria-label={t('enabled')} />
          <div>
            <Text variant="body-4" color="primary">
              {t('sign-in.passkeys.label')}
            </Text>
            <Paragraph>
              {t('sign-in.passkeys.description')}
              <PopOver
                videoSrc="/auth/passkeys.gif"
                triggerVariants={{
                  variant: 'body-4',
                  color: 'tertiary',
                }}
                label={t('sign-in.passkeys.about.title')}
                content={t('sign-in.passkeys.about.description')}
              />
            </Paragraph>
          </div>
        </Topic>
      </Stack>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} solid;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
  `}
`;

const Paragraph = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.tertiary};

    button {
      margin-left: ${theme.spacing[2]};
    }
  `}
`;

const Header = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[1]};
  `}
`;

const Topic = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    align-content: center;

    .icon {
      flex-shrink: 0;
    }
  `}
`;

export default Preview;
