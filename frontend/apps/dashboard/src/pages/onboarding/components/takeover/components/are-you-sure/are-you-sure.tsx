import type { InProgressOnboarding } from '@onefootprint/types';
import { Button, Dialog, Stack, Text } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

type AreYouSureProps = {
  inProgressOnboardings: InProgressOnboarding[];
  onCreateBusinessAccount: () => void;
  onCancel: () => void;
  isOpen: boolean;
};

const AreYouSure = ({ inProgressOnboardings, onCreateBusinessAccount, onCancel, isOpen }: AreYouSureProps) => {
  const { t } = useTranslation('onboarding', { keyPrefix: 'in-progress.are-you-sure' });

  return (
    <Dialog size="compact" title={t('title')} open={isOpen} onClose={onCancel} isConfirmation>
      <Stack gap={9} direction="column">
        <Text variant="body-3" aria-label="description">
          <Trans
            ns="onboarding"
            i18nKey="in-progress.are-you-sure.description-single"
            components={{
              link: <StyledLink href={inProgressOnboardings[0].tenant.websiteUrl}>{t('link-text')}</StyledLink>,
              b: (
                <Text variant="label-3" tag="span">
                  {inProgressOnboardings[0].tenant.name}
                </Text>
              ),
            }}
          />
        </Text>
        <Stack direction="row" justify="flex-end" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={onCreateBusinessAccount}>{t('actions.create-business-acc')}</Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

const StyledLink = styled.a`
  ${createFontStyles('body-3')}
  ${({ theme }) => `
    color: ${theme.color.accent[500]};
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: ${theme.color.accent[600]};
    }
  `}
`;

export default AreYouSure;
