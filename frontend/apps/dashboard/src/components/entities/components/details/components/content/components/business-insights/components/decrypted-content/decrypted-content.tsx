import React from 'react';
import { useTranslation } from 'react-i18next';

import type { WithEntityProps } from '@/entity/components/with-entity';
import { IcoEye16, IcoFileText16, IcoStore16, IcoUsers16 } from '@onefootprint/icons';
import { BusinessInsights } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import BusinessNameList from '../business-name-list';
import OtherBusinessDetails from '../other-business-details';
import PeopleList from '../people-list';
import SOSFilings from '../sos-filings';
import Subsection from '../subsection';
import Watchlist from '../watchlist';

export type DecryptedContentProps = WithEntityProps & {
  insights: BusinessInsights;
};

const DecryptedContent = ({ insights }: DecryptedContentProps) => {
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
    sosFilings: {
      title: t('sos-filings.title'),
      iconComponent: IcoFileText16,
    },
    watchlist: {
      title: t('watchlist.title'),
      iconComponent: IcoEye16,
    },
  };

  return (
    <Stack direction="column" gap={5}>
      <Subsection icon={subsections.name.iconComponent} title={subsections.name.title}>
        <BusinessNameList data={insights.names} />
      </Subsection>
      <Subsection icon={subsections.details.iconComponent} title={subsections.details.title}>
        <OtherBusinessDetails data={insights.details} />
      </Subsection>
      <Subsection icon={subsections.people.iconComponent} title={subsections.people.title}>
        <PeopleList data={insights.people} />
      </Subsection>
      <Subsection icon={subsections.sosFilings.iconComponent} title={subsections.sosFilings.title}>
        <SOSFilings data={insights.registrations} />
      </Subsection>
      <Subsection icon={subsections.watchlist.iconComponent} title={subsections.watchlist.title}>
        <Watchlist data={insights.watchlist} />
      </Subsection>
    </Stack>
  );
};

export default DecryptedContent;
