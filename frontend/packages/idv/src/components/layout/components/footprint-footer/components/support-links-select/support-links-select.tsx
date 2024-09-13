import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Dropdown, createFontStyles, useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type SupportLinksSelectProps = {
  config?: PublicOnboardingConfig;
};

const SupportLinksSelect = ({ config }: SupportLinksSelectProps) => {
  const toast = useToast();
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.footer',
  });
  const shouldShowSupportLinks = config?.supportEmail || config?.supportPhone || config?.supportWebsite;

  const copyToClipboard = (phoneNumber?: string) => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      toast.show({
        title: t('support.phone.toast-success.title'),
        description: t('support.phone.toast-success.description'),
      });
    } else {
      toast.show({
        title: t('support.phone.toast-error.title'),
        description: t('support.phone.toast-error.description'),
      });
    }
  };

  const sendEmail = (email?: string) => {
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    } else {
      toast.show({
        title: t('support.email.toast-error.title'),
        description: t('support.email.toast-error.description'),
      });
    }
  };

  const openLink = (link?: string) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      toast.show({
        title: t('support.website.toast-error.title'),
        description: t('support.website.toast-error.description'),
      });
    }
  };

  const supportLinks = [
    {
      label: t('support.email.label'),
      contactLink: config?.supportEmail,
      onSelect: sendEmail,
    },
    {
      label: t('support.phone.label'),
      contactLink: config?.supportPhone,
      onSelect: copyToClipboard,
    },
    {
      label: t('support.website.label'),
      contactLink: config?.supportWebsite,
      onSelect: openLink,
    },
  ];

  return shouldShowSupportLinks ? (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <StyledTrigger>{t('support.label')}</StyledTrigger>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content sideOffset={8} minWidth="160px">
          {supportLinks.map(({ label, contactLink, onSelect }) =>
            label && contactLink ? (
              <StyledItem key={label} size="tiny" onSelect={() => onSelect(contactLink)}>
                {label}
              </StyledItem>
            ) : null,
          )}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  ) : null;
};

const StyledTrigger = styled.button`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('caption-1')}
    color: ${theme.color.secondary};
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[1]};
    cursor: pointer;

    &:hover:enabled {
      background-color: ${theme.backgroundColor.transparent};
    }

    &[data-state='open'] {
      &::after {
        content: '';
        position: absolute;
        top: calc(-${theme.spacing[2]} / 2);
        left: calc(-${theme.spacing[3]} / 2);
        width: calc(100% + ${theme.spacing[3]});
        height: calc(100% + ${theme.spacing[2]});
        z-index: -1;
        background-color: ${theme.backgroundColor.senary};
        border-radius: ${theme.borderRadius.sm};
      }
    }

    &:hover {
      text-decoration: underline;
      text-decoration-thickness: 1.5px;
    }
  `}
`;

const StyledItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('caption-1')}
    display: flex;
    align-items: center;
    justify-content: start;
    padding: ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[2]}
      ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.sm};
    cursor: pointer;
    gap: ${theme.spacing[2]};

    &:hover {
      background-color: ${theme.backgroundColor.senary};
    }
  `}
`;

export default SupportLinksSelect;
