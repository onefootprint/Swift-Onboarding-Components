import { Checkbox, LinkButton, Stack } from '@onefootprint/ui';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import usePlaybookOptions from 'src/pages/home/hooks/use-playbook-options';

import type { FormData } from '../../drawer-filter.type';
import ErrorComponent from './components/error';
import Loading from './components/loading';

const MAX_PLAYBOOKS = 5;

type PlaybookMeta = {
  label: string;
  value: string;
};

const Playbooks = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entities.filters.drawer',
  });
  const methods = useFormContext<FormData>();
  const { register, getValues } = methods;
  const { data, isPending: playbooksLoading, isError: playbooksError } = usePlaybookOptions({});
  const [showAllPlaybooks, setShowAllPlaybooks] = useState(false);

  // Sort the playbooks to show the selected ones first when the panel first launches
  // We don't sort when the user is checking boxes because it is confusing to have
  // the content shift around as they interact with the checkboxes
  const sortedPlaybooks = useMemo(() => {
    const selectedPlaybooks = new Set(
      Object.entries(getValues('playbooks'))
        .filter(([, value]) => value)
        .map(([key]) => key),
    );
    return (data ?? []).sort((a: PlaybookMeta, b: PlaybookMeta) => {
      if (selectedPlaybooks.has(a.value)) {
        return -1;
      }
      if (selectedPlaybooks.has(b.value)) {
        return 1;
      }
      return 0;
    });
  }, [data]);

  const displayedPlaybooks = useMemo(() => {
    const playbooksLength = data ? data.length : 0;
    return sortedPlaybooks.slice(0, showAllPlaybooks ? playbooksLength : MAX_PLAYBOOKS);
  }, [data, sortedPlaybooks, showAllPlaybooks]);

  const handleTogglePlaybooks = () => {
    setShowAllPlaybooks(!showAllPlaybooks);
  };

  return (
    <Stack direction="column" gap={5}>
      <Stack direction="column" gap={3}>
        {playbooksLoading && <Loading count={MAX_PLAYBOOKS} />}
        {data &&
          displayedPlaybooks.map(playbook => (
            <Checkbox key={playbook.value} label={playbook.label} {...register(`playbooks.${playbook.value}`)} />
          ))}
      </Stack>
      {data && data.length > MAX_PLAYBOOKS && (
        <LinkButton onClick={handleTogglePlaybooks}>
          {showAllPlaybooks ? t('playbooks.show-less') : t('playbooks.show-more')}
        </LinkButton>
      )}
      {playbooksError && <ErrorComponent />}
    </Stack>
  );
};

export default Playbooks;
