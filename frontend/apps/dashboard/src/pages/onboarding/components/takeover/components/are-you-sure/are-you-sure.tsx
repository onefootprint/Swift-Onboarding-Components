import { IcoArrowTopRight24 } from '@onefootprint/icons';
import type { InProgressOnboarding } from '@onefootprint/types';
import { Button, Dialog, LinkButton, Stack, Text } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

export type AreYouSureProps = {
  inProgressOnboardings: InProgressOnboarding[];
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
};

const AreYouSure = ({ inProgressOnboardings, onConfirm, onCancel, isOpen }: AreYouSureProps) => {
  const { t } = useTranslation('onboarding', { keyPrefix: 'in-progress.are-you-sure' });
  const isSingleTenant = inProgressOnboardings.length === 1;
  const multipleTenantsSomeWithURL =
    !isSingleTenant && inProgressOnboardings.some(onboarding => onboarding.tenant.websiteUrl);

  return (
    <Dialog size="compact" title={t('title')} open={isOpen} onClose={onCancel} isConfirmation>
      <Stack gap={9} direction="column">
        <Stack gap={5} direction="column">
          <Text variant="body-3" aria-label={t('aria')}>
            {isSingleTenant ? (
              <Trans
                ns="onboarding"
                i18nKey="in-progress.are-you-sure.description-single"
                components={{
                  link: inProgressOnboardings[0].tenant.websiteUrl ? (
                    <StyledLink href={inProgressOnboardings[0].tenant.websiteUrl}>{t('link-text')}</StyledLink>
                  ) : (
                    <Text variant="label-3" tag="span">
                      {inProgressOnboardings[0].tenant.name}
                    </Text>
                  ),
                  b: (
                    <Text variant="label-3" tag="span">
                      {inProgressOnboardings[0].tenant.name}
                    </Text>
                  ),
                }}
              />
            ) : (
              <Trans
                ns="onboarding"
                i18nKey="in-progress.are-you-sure.description-many"
                components={{
                  b1: (
                    <Text variant="label-3" tag="span">
                      {inProgressOnboardings
                        .slice(0, -1)
                        .map(onboarding => onboarding.tenant.name)
                        .join(', ')}
                    </Text>
                  ),
                  b2: (
                    <Text variant="label-3" tag="span">
                      {inProgressOnboardings[inProgressOnboardings.length - 1].tenant.name}
                    </Text>
                  ),
                }}
              />
            )}
          </Text>
          {multipleTenantsSomeWithURL && (
            <Stack direction="column">
              {inProgressOnboardings
                .filter(onboarding => !!onboarding.tenant.websiteUrl)
                .map(onboarding => (
                  <Stack key={onboarding.tenant.name}>
                    <LinkButton href={onboarding.tenant.websiteUrl}>
                      {t('go-to-website', { tenant: onboarding.tenant.name })}
                    </LinkButton>
                    <IcoArrowTopRight24 color="accent" />
                  </Stack>
                ))}
            </Stack>
          )}
        </Stack>

        <Stack direction="row" justify="flex-end" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={onConfirm}>{t('actions.create-business-acc')}</Button>
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
