import { useTranslation } from '@onefootprint/hooks';
import { IcoSmartphone224 } from '@onefootprint/icons';
import { Container, Stack } from '@onefootprint/ui';
import React from 'react';
import { isMobile } from 'react-device-detect';

import Title from '../../title';
import OsProtected from './components/illustrations/os-protected';
import PhishingResistant from './components/illustrations/phishing-resistant';
import SecureEnclaves from './components/illustrations/secure-enclaves';
import Strong from './components/illustrations/strong';
import Section from './components/section/section';

const sections = [
  { translations: 'strong', illustration: <Strong /> },
  { translations: 'os-protected', illustration: <OsProtected /> },
  { translations: 'phishing-resistant', illustration: <PhishingResistant /> },
  { translations: 'secure-enclaves', illustration: <SecureEnclaves /> },
];

const Secure = () => {
  const { t } = useTranslation('pages.auth.sections');
  return (
    <Container
      sx={{
        marginTop: 12,
      }}
    >
      <Title
        icon={IcoSmartphone224}
        title={t('title')}
        subtitle={t('subtitle')}
      />
      <Stack direction="column" gap={isMobile ? 4 : 12} paddingTop={11}>
        {sections.map(({ translations, illustration }, index) => (
          <Section
            title={t(`${translations}.title`)}
            subtitle={t(`${translations}.subtitle`)}
            image={illustration}
            inverted={!isMobile ? index % 2 !== 0 : false}
            key={translations}
          />
        ))}
      </Stack>
    </Container>
  );
};

export default Secure;
