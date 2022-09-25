import type { ApiKey } from '@onefootprint/types';
import { useTranslation } from 'hooks';
import { IcoDotsHorizontal24 } from 'icons';
import React from 'react';
import { Badge, Dropdown } from 'ui';

import KeyCell from './components/key-cell';
import useReveal from './hooks/use-reveal-key';
import useUpdateStatus from './hooks/use-update-status';

type RowProps = {
  apiKey: ApiKey;
};

const Row = ({ apiKey }: RowProps) => {
  const { t } = useTranslation('pages.developers.api-keys.table.manage');
  const reveal = useReveal(apiKey);
  const status = useUpdateStatus(apiKey);
  const isEnabled = apiKey.status === 'enabled';

  return (
    <>
      <td>{apiKey.name}</td>
      <td>
        <KeyCell isLoading={reveal.mutation.isLoading} value={apiKey.key} />
      </td>
      <td>{apiKey.lastUsedAt || '--'}</td>
      <td>{apiKey.createdAt}</td>
      <td>
        <Badge variant={isEnabled ? 'success' : 'error'}>{apiKey.status}</Badge>
      </td>
      <td>
        <Dropdown.Root>
          <Dropdown.Trigger aria-label={t('aria-label')}>
            <IcoDotsHorizontal24 />
          </Dropdown.Trigger>
          <Dropdown.Content align="end">
            <Dropdown.Item onSelect={reveal.toggle}>
              {apiKey.key ? t('reveal.hide') : t('reveal.show')}
            </Dropdown.Item>
            <Dropdown.Item onSelect={status.toggle}>
              {isEnabled ? t('status.disable') : t('status.enable')}
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
      </td>
    </>
  );
};

export default Row;
