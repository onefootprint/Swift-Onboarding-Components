import { Stack } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { ErrorComponent } from 'src/components';

import useListDetails from '../../../../hooks/use-list-details';
import SectionTitle from '../section-title';
import Content from './components/content';
import Loading from './components/loading';

const Playbooks = () => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.playbooks',
  });
  const router = useRouter();
  const id = router.query.id as string;
  const { isPending, error, data } = useListDetails(id);

  return (
    <Stack gap={5} direction="column">
      <SectionTitle title={t('title', { alias: data?.alias })} />
      {isPending && <Loading />}
      {error ? <ErrorComponent error={error} /> : null}
      {data && <Content list={data} />}
    </Stack>
  );
};

export default Playbooks;
