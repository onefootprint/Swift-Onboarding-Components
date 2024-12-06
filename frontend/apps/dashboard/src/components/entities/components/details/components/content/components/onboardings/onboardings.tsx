import { getEntitiesByFpIdOnboardingsOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';
import Section from '../section';

import useEntityId from '../../../../hooks/use-entity-id';
import Content from './components/content';
import Loading from './components/loading';

const Onboardings = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings',
  });
  const entityId = useEntityId();
  const { isPending, data, error } = useQuery(
    getEntitiesByFpIdOnboardingsOptions({
      path: { fpId: entityId },
    }),
  );

  return (
    <Section title={t('title')}>
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
      {data && <Content onboardings={data.data} />}
    </Section>
  );
};

export default Onboardings;
