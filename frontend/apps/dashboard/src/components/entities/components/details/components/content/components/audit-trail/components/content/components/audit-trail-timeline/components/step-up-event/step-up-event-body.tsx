import type { StepUpEventData } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import { useTranslation } from 'react-i18next';

import EventBodyEntry from '../event-body-entry';

type StepUpEventBodyProps = {
  data: StepUpEventData;
};

const StepUpEventBody = ({ data }: StepUpEventBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.step-up-event.kind',
  });
  const documents = data.map(document => t(`${kebabCase(document.kind)}` as ParseKeys<'common'>)).join(', ');

  return (
    <div data-dd-privacy="mask">
      <EventBodyEntry
        iconColor="primary"
        content={
          <>
            <Text variant="label-3" color="primary" marginRight={2}>
              {t('document-requested', { count: data.length })}
            </Text>
            {documents}
          </>
        }
      />
    </div>
  );
};

export default StepUpEventBody;
