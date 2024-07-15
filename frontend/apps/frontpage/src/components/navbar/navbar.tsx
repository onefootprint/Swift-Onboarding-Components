import {
  IcoBank24,
  IcoBuilding24,
  IcoCar24,
  IcoDollar24,
  IcoKey24,
  IcoMegaphone24,
  IcoShield24,
  IcoSquareFrame24,
  IcoStore24,
  IcoUser24,
  IcoWriting24,
} from '@onefootprint/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';
import type { NavEntry } from './types';

const Navbar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.navbar' });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const entries: NavEntry[] = [
    {
      text: t('entries.platform.text'),
      items: [
        {
          text: t('entries.platform.links.kyc.text'),
          subtext: t('entries.platform.links.kyc.subtext'),
          href: t('entries.platform.links.kyc.href'),
          iconComponent: IcoUser24,
        },
        {
          text: t('entries.platform.links.kyb.text'),
          subtext: t('entries.platform.links.kyb.subtext'),
          href: t('entries.platform.links.kyb.href'),
          iconComponent: IcoStore24,
        },
        {
          text: t('entries.platform.links.vaulting.text'),
          subtext: t('entries.platform.links.vaulting.subtext'),
          href: t('entries.platform.links.vaulting.href'),
          iconComponent: IcoKey24,
        },
        {
          text: t('entries.platform.links.auth.text'),
          subtext: t('entries.platform.links.auth.subtext'),
          href: t('entries.platform.links.auth.href'),
          iconComponent: IcoShield24,
        },
        {
          text: t('entries.platform.links.doc-scan.text'),
          subtext: t('entries.platform.links.doc-scan.subtext'),
          href: t('entries.platform.links.doc-scan.href'),
          iconComponent: IcoSquareFrame24,
        },
      ],
    },
    {
      text: t('entries.industries.text'),
      items: [
        {
          text: t('entries.industries.links.auto.text'),
          subtext: t('entries.industries.links.auto.subtext'),
          href: t('entries.industries.links.auto.href'),
          iconComponent: IcoCar24,
        },
        {
          text: t('entries.industries.links.financial-institutions.text'),
          subtext: t('entries.industries.links.financial-institutions.subtext'),
          href: t('entries.industries.links.financial-institutions.href'),
          iconComponent: IcoBank24,
        },
        {
          text: t('entries.industries.links.fintech.text'),
          subtext: t('entries.industries.links.fintech.subtext'),
          href: t('entries.industries.links.fintech.href'),
          iconComponent: IcoDollar24,
        },
        {
          text: t('entries.industries.links.real-estate.text'),
          subtext: t('entries.industries.links.real-estate.subtext'),
          href: t('entries.industries.links.real-estate.href'),
          iconComponent: IcoBuilding24,
        },
      ],
    },
    { text: t('entries.customers.text'), href: t('entries.customers.href') },
    { text: t('entries.pricing.text'), href: t('entries.pricing.href') },
    { text: t('entries.docs.text'), href: t('entries.docs.href') },
    {
      text: t('entries.writing.text'),
      items: [
        {
          text: t('entries.writing.links.blog.text'),
          href: t('entries.writing.links.blog.href'),
          subtext: t('entries.writing.links.blog.subtext'),
          iconComponent: IcoWriting24,
        },
        {
          text: t('entries.writing.links.investor-updates.text'),
          href: t('entries.writing.links.investor-updates.href'),
          subtext: t('entries.writing.links.investor-updates.subtext'),
          iconComponent: IcoMegaphone24,
        },
      ],
    },
    {
      text: t('entries.changelog.text'),
      href: t('entries.changelog.href'),
    },
  ];

  const handleMobileOpen = () => {
    setIsMobileNavOpen(true);
  };
  const handleMobileClose = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <>
      <MobileNav isOpen={isMobileNavOpen} onOpen={handleMobileOpen} onClose={handleMobileClose} entries={entries} />
      <DesktopNav entries={entries} />
    </>
  );
};

export default Navbar;
