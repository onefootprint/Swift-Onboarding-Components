import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Dropdown, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type SupportSubmenuProps = {
  config?: PublicOnboardingConfig;
};

const SupportSubmenu = ({ config }: SupportSubmenuProps) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const toast = useToast();
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.footer',
  });

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
  const shouldRenderSubmenu = config?.supportEmail || config?.supportPhone || config?.supportWebsite;

  return shouldRenderSubmenu ? (
    <Dropdown.Sub open={submenuOpen}>
      <Dropdown.SubTrigger onPointerDown={() => setSubmenuOpen(!submenuOpen)} size="tiny">
        {`${t('support.label')}...`}
      </Dropdown.SubTrigger>
      <StyledSubcontent onPointerDownOutside={() => setSubmenuOpen(false)}>
        {supportLinks.map(({ label, contactLink, onSelect }) =>
          label && contactLink ? (
            <Dropdown.Item key={label} onSelect={() => onSelect(contactLink)} size="tiny">
              {label}
            </Dropdown.Item>
          ) : null,
        )}
      </StyledSubcontent>
    </Dropdown.Sub>
  ) : null;
};

const StyledSubcontent = styled(Dropdown.SubContent)`
  min-width: 120px;
`;

export default SupportSubmenu;
