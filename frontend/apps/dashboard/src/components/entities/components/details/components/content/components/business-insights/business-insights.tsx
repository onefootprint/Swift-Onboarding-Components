import React from 'react';
import { useTranslation } from 'react-i18next';

import { IcoEye16, IcoFileText16, IcoStore16, IcoUsers16 } from '@onefootprint/icons';
import { BusinessNameKind } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import Section from '../section';
import BusinessNameList from './components/business-name-list';
import Subsection from './components/subsection';

const BusinessInsights = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });

  const subsections = {
    name: {
      title: t('name.title'),
      iconComponent: IcoStore16,
    },
    details: {
      title: t('details.title'),
      iconComponent: IcoStore16,
    },
    people: {
      title: t('people.title'),
      iconComponent: IcoUsers16,
    },
    secretaryOfState: {
      title: t('secretary-of-state.title'),
      iconComponent: IcoFileText16,
    },
    watchlist: {
      title: t('watchlist.title'),
      iconComponent: IcoEye16,
    },
  };

  const mockResponse = {
    names: [
      {
        kind: 'dba' as BusinessNameKind,
        name: 'BobCo',
        sources: 'website',
        subStatus: 'Unverified',
        submitted: true,
        verified: false,
      },
      {
        kind: 'legal' as BusinessNameKind,
        name: 'Bobby Corp Labs, Inc.',
        sources: 'DE - SOS',
        subStatus: 'Verified',
        submitted: true,
        verified: true,
      },
    ],
  };

  return (
    <Section title={t('title')}>
      <Stack direction="column" gap={5}>
        <Subsection icon={subsections.name.iconComponent} title={subsections.name.title}>
          <BusinessNameList data={mockResponse.names} />
        </Subsection>
      </Stack>
    </Section>
  );
};

export default BusinessInsights;
