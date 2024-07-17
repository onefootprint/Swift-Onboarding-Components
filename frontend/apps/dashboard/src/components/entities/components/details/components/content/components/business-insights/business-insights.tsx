import React from 'react';
import { useTranslation } from 'react-i18next';

import { IcoEye16, IcoFileText16, IcoStore16, IcoUsers16 } from '@onefootprint/icons';
import { Stack } from '@onefootprint/ui';
import Section from '../section';
import BusinessNameList from './components/business-name-list';
import OtherBusinessDetails from './components/other-business-details';
import PeopleList from './components/people-list';
import Subsection from './components/subsection';
import useBusinessInsights from './hooks/use-business-insights';

const BusinessInsights = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const { response: mockResponse } = useBusinessInsights();

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
      title: t('sos-filings.title'),
      iconComponent: IcoFileText16,
    },
    watchlist: {
      title: t('watchlist.title'),
      iconComponent: IcoEye16,
    },
  };

  return (
    <Section title={t('title')}>
      <Stack direction="column" gap={5}>
        <Subsection icon={subsections.name.iconComponent} title={subsections.name.title}>
          <BusinessNameList data={mockResponse.names} />
        </Subsection>
        <Subsection icon={subsections.details.iconComponent} title={subsections.details.title}>
          <OtherBusinessDetails data={mockResponse.details} />
        </Subsection>
        <Subsection icon={subsections.people.iconComponent} title={subsections.people.title}>
          <PeopleList data={mockResponse.people} />
        </Subsection>
      </Stack>
    </Section>
  );
};

export default BusinessInsights;
