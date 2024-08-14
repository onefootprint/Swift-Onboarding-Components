import { InlineAlert } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { useEntitiesContext } from '@/entities/components/list/hooks/use-entities-context';
import useFilters, { EntityStatusFilter } from '@/entities/hooks/use-filters';

import useShouldShow from './hooks/use-should-show';

const Info = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entities.filters' });
  const { shouldShow, dismiss } = useShouldShow();
  const {
    values: { state, verification },
  } = useFilters();
  const context = useEntitiesContext();
  const kind = t(`kind.${context.kind}`);

  const getText = () => {
    if (verification === EntityStatusFilter.manualReview) {
      return t('info.manual-review', { kind });
    }
    if (verification === EntityStatusFilter.none) {
      return t('info.none', { kind });
    }
    if (verification === EntityStatusFilter.failed) {
      return t('info.failed', { kind });
    }
    if (verification === EntityStatusFilter.pass) {
      return t('info.pass', { kind });
    }
    if (state === EntityStatusFilter.incomplete) {
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
