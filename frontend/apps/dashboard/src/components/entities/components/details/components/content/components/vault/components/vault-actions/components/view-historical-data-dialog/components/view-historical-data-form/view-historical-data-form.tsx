import { Hint, Radio, Stack, Text, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TimelineItemTime from 'src/components/timeline-item-time';
import type { AuditTrailTimelineEvent } from 'src/utils/merge-audit-trail-timeline-events';
import styled from 'styled-components';

import getEventText from './utils/get-event-text';

export type HistoricalFormData = {
  seqno: string;
};

type ViewHistoricalDataFormProps = {
  events: AuditTrailTimelineEvent[];
  onSubmit: (data: HistoricalFormData) => void;
};

const ViewHistoricalDataForm = ({ events, onSubmit }: ViewHistoricalDataFormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.view-historical-data.form',
  });
  const methods = useForm<HistoricalFormData>();
  const {
    handleSubmit,
    register,
    setValue,
    setError,
    reset,
    clearErrors,
    formState: { errors },
  } = methods;

  const resetForm = () => {
    reset();
    clearErrors();
  };

  const handleSelect = (seqno: string) => {
    resetForm();
    setValue('seqno', seqno);
  };

  const handleBeforeSubmit = (data: HistoricalFormData) => {
    if (data.seqno) {
      onSubmit(data);
    } else {
      setError('seqno', {
        type: 'required',
        message: t('required-error'),
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form id="view-historical-data-form" onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Stack direction="column" justify="flex-start" gap={7}>
          <Stack direction="column" gap={2}>
            <Text variant="label-3">{t('heading')}</Text>
            <Text variant="body-3">{t('subheading')}</Text>
          </Stack>
          <fieldset>
            <Stack direction="column" gap={4}>
              {events.map(event => {
                const { time, seqno } = event;
                const eventText = getEventText(event);
                return eventText ? (
                  <Stack direction="column" key={'timestamp' in time ? time.timestamp : time.end}>
                    <Radio
                      label={eventText}
                      value={`${seqno}`}
                      {...register('seqno')}
                      onChange={() => handleSelect(`${seqno}`)}
                    />
                    {time && (
                      <TimeContainer>
                        <TimelineItemTime time={time} />
                      </TimeContainer>
                    )}
                  </Stack>
                ) : null;
              })}
            </Stack>
            {errors.seqno && <Hint hasError>{errors.seqno.message as string}</Hint>}
          </fieldset>
        </Stack>
      </form>
    </FormProvider>
  );
};

const TimeContainer = styled.div`
  margin-left: 27px;

  > p {
    ${createFontStyles('body-4')};
  }
`;

export default ViewHistoricalDataForm;
