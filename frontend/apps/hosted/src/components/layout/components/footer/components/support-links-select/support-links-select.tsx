import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Dropdown, createFontStyles, useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type SupportLinksSelectProps = {
  config?: PublicOnboardingConfig;
};
type SupportLinkType = 'email' | 'phone' | 'website';

const SupportLinksSelect = ({ config }: SupportLinksSelectProps) => {
  const toast = useToast();
  const { t } = useTranslation('common', {
    keyPrefix: 'components.layout.app-footer',
  });
  const shouldShowSupportLinks = config?.supportEmail || config?.supportPhone || config?.supportWebsite;

  const copyToClipboard = (phoneNumber?: string) => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      toast.show({
        title: t('links.support.phone.toast-success.title'),
        description: t('links.support.phone.toast-success.description'),
      });
    } else {
      toast.show({
        title: t('links.support.phone.toast-error.title'),
        description: t('links.support.phone.toast-error.description'),
      });
    }
  };

  const sendEmail = (email?: string) => {
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    } else {
      toast.show({
        title: t('links.support.email.toast-error.title'),
        description: t('links.support.email.toast-error.description'),
      });
    }
  };

  const openLink = (link?: string) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      toast.show({
        title: t('links.support.website.toast-error.title'),
        description: t('links.support.website.toast-error.description'),
      });
    }
  };

  const supportLinks = [
    {
      label: t('links.support.email.label'),
      contactLink: config?.supportEmail,
      type: 'email' as SupportLinkType,
      onSelect: sendEmail,
    },
    {
      label: t('links.support.phone.label'),
      contactLink: config?.supportPhone,
      type: 'phone' as SupportLinkType,
      onSelect: copyToClipboard,
    },
    {
      label: t('links.support.website.label'),
      contactLink: config?.supportWebsite,
      type: 'website' as SupportLinkType,
      onSelect: openLink,
    },
  ];

  return shouldShowSupportLinks ? (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <StyledTrigger>{t('links.support.label')}</StyledTrigger>
      </Dropdown.Trigger>
      <StyledContent sideOffset={8}>
        {supportLinks.map(({ label, contactLink, type, onSelect }) =>
          label && contactLink ? (
            <StyledItem key={type} size="tiny" onSelect={() => onSelect(contactLink)}>
              {label}
            </StyledItem>
          ) : null,
        )}
      </StyledContent>
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

const StyledContent = styled(Dropdown.Content)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    overflow: hidden;
    z-index: ${theme.zIndex.sticky};
    padding: ${theme.spacing[2]};
  `}
`;

export default SupportLinksSelect;
