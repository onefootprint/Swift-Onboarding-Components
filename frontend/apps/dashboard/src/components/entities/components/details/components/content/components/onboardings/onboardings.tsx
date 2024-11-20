import { getEntitiesByFpIdOnboardingsOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';
import Section from '../section';

import type { WithEntityProps } from '@/entity/components/with-entity';
import Content from './components/content';
import Loading from './components/loading';

export type OnboardingsProps = WithEntityProps;

const Onboardings = ({ entity }: OnboardingsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings',
  });
  const { isPending, data, error } = useQuery(
    getEntitiesByFpIdOnboardingsOptions({
      path: { fpId: entity.id },
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
