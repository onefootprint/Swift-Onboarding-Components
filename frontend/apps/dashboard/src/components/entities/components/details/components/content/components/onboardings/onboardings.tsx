import { getEntitiesByFpIdOnboardingsOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';
import Section from '../section';

import { useEntityContext } from '../../../../hooks/use-entity-context';
import useEntityId from '../../../../hooks/use-entity-id';
import Content from './components/content';
import Loading from './components/loading';

const Onboardings = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings',
  });
  const { kind } = useEntityContext();
  const entityId = useEntityId();
  const { isPending, data, error } = useQuery({
    ...getEntitiesByFpIdOnboardingsOptions({
      path: { fpId: entityId },
    }),
    enabled: Boolean(entityId),
  });
  const hasOnboardings = data?.data && data?.data.length > 0;

  return (
    <Section title={t('title')}>
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
      {hasOnboardings ? (
        <Content onboardings={data.data} />
      ) : (
        <p className="text-body-3 text-primary">{t('no-onboardings', { kind })}</p>
      )}
    </Section>
  );
};

export default Onboardings;
