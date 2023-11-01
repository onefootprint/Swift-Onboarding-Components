import { useTranslation } from '@onefootprint/hooks';
import { EntityStatus } from '@onefootprint/types';
import { InlineAlert } from '@onefootprint/ui';
import React from 'react';

import { useEntitiesContext } from '@/entities/components/list/hooks/use-entities-context';
import useFilters from '@/entities/hooks/use-filters';

import useShouldShow from './hooks/use-should-show';

const Info = () => {
  const { t } = useTranslation('pages.entities.filters');
  const { shouldShow, dismiss } = useShouldShow();
  const {
    values: { state, verification },
  } = useFilters();
  const context = useEntitiesContext();
  const kind = t(`kind.${context.kind}`);

  const getText = () => {
    if (verification === EntityStatus.manualReview) {
      return t('info.manual-review', { kind });
    }
    if (verification === EntityStatus.none) {
      return t('info.none', { kind });
    }
    if (verification === EntityStatus.failed) {
      return t('info.failed', { kind });
    }
    if (verification === EntityStatus.pass) {
      return t('info.pass', { kind });
    }
    if (state === EntityStatus.incomplete) {
      return t('info.incomplete', { kind });
    }
    return t('info.complete', { kind });
  };

  return shouldShow && (state || verification) ? (
    <InlineAlert
      variant="info"
      cta={{
        label: t('info.cta'),
        onClick: dismiss,
      }}
    >
      {getText()}
    </InlineAlert>
  ) : null;
};

export default Info;
