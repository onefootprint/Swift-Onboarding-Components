import { Hint, Radio, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TimelineItemTime from 'src/components/timeline-item-time';
import type { AuditTrailTimelineEvent } from 'src/utils/merge-audit-trail-timeline-events';
import styled, { css } from 'styled-components';

import useEntitySeqno from '@/entity/hooks/use-entity-seqno';

import getTimelineEventText from '@/entities/components/details/components/content/utils/get-timeline-event-text';
import type { HistoricalFormData } from '../../view-historical-data-dialog.types';

export type ViewHistoricalDataFormProps = {
  events: AuditTrailTimelineEvent[];
  onSubmit: (formData: HistoricalFormData) => void;
};

const ViewHistoricalDataForm = ({ events, onSubmit }: ViewHistoricalDataFormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.view-historical-data.form',
  });
  const currentSeqno = useEntitySeqno();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<HistoricalFormData>({
    defaultValues: { seqno: currentSeqno },
  });
  const errorMessage = errors.seqno?.message;

  const renderEvent = (event: AuditTrailTimelineEvent) => {
    const { time, seqno } = event;
    const eventText = getTimelineEventText(event);
    return eventText ? (
      <Stack direction="column" key={'timestamp' in time ? time.timestamp : time.end}>
        <Radio label={eventText} value={`${seqno}`} {...register('seqno', { required: t('required-error') })} />
        {time && (
          <TimeContainer>
            <TimelineItemTime time={time} />
          </TimeContainer>
        )}
      </Stack>
    ) : null;
  };

  return (
    <form id="view-historical-data-form" onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" justify="flex-start" gap={7} marginBottom={5}>
        <Stack direction="column" gap={2}>
          <Text variant="label-3">{t('heading')}</Text>
          <Text variant="body-3">{t('subheading')}</Text>
        </Stack>
        <Stack direction="column" gap={4}>
          {events.map(renderEvent)}
        </Stack>
      </Stack>
      {errorMessage && <Hint hasError>{errorMessage}</Hint>}
    </form>
  );
};

const TimeContainer = styled.div`
  ${({ theme }) => css`
    margin-left: calc(${theme.spacing[7]} + ${theme.spacing[2]});
    > div {
      gap: ${theme.spacing[2]};
      p {
        ${createFontStyles('body-4')};
        min-width: 0;
      }
      p:not(:last-child)::after {
        content: ', ';
      }
    }
  `}
`;

export default ViewHistoricalDataForm;
