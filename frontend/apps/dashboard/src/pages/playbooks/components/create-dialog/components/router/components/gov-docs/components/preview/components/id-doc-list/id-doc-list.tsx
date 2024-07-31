import type { SupportedIdDocTypes } from '@onefootprint/types';
import { Stack, Text, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useIdDocList from 'src/hooks/use-id-doc-list';

export type IdDocListProps = {
  docs: SupportedIdDocTypes[];
  limit?: number;
};

const IdDocList = ({ docs, limit = 10 }: IdDocListProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.gov-docs' });
  const list = useIdDocList(docs);
  const firstPart = list.slice(0, limit);
  const lastPart = list.slice(limit);
  const shouldCut = list.length > limit;

  return shouldCut ? (
    <Stack gap={2} alignItems="center">
      <Text variant="body-3" color="tertiary">
        {firstPart.join(', ')}
      </Text>
      <Text variant="body-3" color="tertiary">
        {t('list.add')}
      </Text>
      <Tooltip text={lastPart.join(', ')}>
        <Text variant="body-3" color="tertiary" textDecoration="underline">
          {t('list.more', { count: lastPart.length })}
        </Text>
      </Tooltip>
    </Stack>
  ) : (
    <Text variant="body-3" color="tertiary">
      {list.join(', ')}
    </Text>
  );
};

export default IdDocList;
