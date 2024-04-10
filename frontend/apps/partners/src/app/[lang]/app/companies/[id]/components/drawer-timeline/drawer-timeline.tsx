import {
  IcoClose16,
  IcoPencil16,
  IcoUpload16,
  IcoUser16,
} from '@onefootprint/icons';
import { Drawer, LinkButton, Stack, Text } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Lang } from '@/app/types';
import { dateFormatter, getDocStatus, getOr } from '@/helpers';
import type { ComplianceDocEvent } from '@/queries';
import { getPartnerPartnershipsDocumentsEvents } from '@/queries';

import { sortByTimestampDesc } from '../../helpers';
import Loading from './loading';

type DrawerTimelineProps = {
  docId?: string;
  docStatus: string;
  isOpen?: boolean;
  lang: Lang;
  onClose: () => void;
  onViewSubmissionClick: (docId?: string, subId?: string) => void;
  partnerId?: string;
};

const join = (...args: unknown[]): string => args.filter(Boolean).join(' ');
const actFirstName = getOr<string>('', 'actor.user.firstName');
const actLastName = getOr<string>('', 'actor.user.lastName');
const endFirstName = getOr<string>('', 'event.data.assignedTo.user.firstName');
const endLastName = getOr<string>('', 'event.data.assignedTo.user.lastName');
const endOrg = getOr<string>('', 'event.data.assignedTo.org');
const docName = getOr<string>('', 'event.data.name');
const submissionId = getOr<string>('', 'event.data.submissionId');
const decision = getOr<string>('', 'event.data.decision');
const note = getOr<string>('', 'event.data.note');

const isRejected = (x: unknown) => x === 'rejected';
const isAssigned = (x: unknown) => x === 'assigned';
const isRequested = (x: unknown) => x === 'requested';
const isRetracted = (x: unknown) => x === 'request_retracted';
const isReviewed = (x: unknown) => x === 'reviewed';
const isSubmitted = (x: unknown) => x === 'submitted';

const getActorName = (x: object) => join(actFirstName(x), actLastName(x));
const getEndName = (x: object) => join(endFirstName(x), endLastName(x));

const DrawerTimeline = ({
  docId,
  docStatus,
  isOpen,
  lang,
  onClose,
  onViewSubmissionClick,
  partnerId,
}: DrawerTimelineProps) => {
  const { t } = useTranslation('common');
  const [events, setEvents] = useState<ComplianceDocEvent[]>([]);
  const docRef = useRef('');
  const status = getDocStatus(t, docStatus);

  useEffect(() => {
    if (!partnerId || !docId) return;
    if (docRef.current === docId) return;
    docRef.current = docId;
    getPartnerPartnershipsDocumentsEvents(partnerId, docId)
      .then(list => list.sort(sortByTimestampDesc))
      .then(setEvents);
  }, [partnerId, docId]);

  const handleClose = () => {
    setEvents([]);
    docRef.current = '';
    onClose();
  };

  return isOpen ? (
    <Drawer
      onClickOutside={handleClose}
      onClose={handleClose}
      open={isOpen}
      title={t('doc.document-history')}
    >
      {!events.length ? (
        <Loading />
      ) : (
        <>
          <Stack
            paddingBlock={3}
            paddingInline={4}
            justifyContent="space-between"
            borderColor="primary"
            borderRadius="default"
            borderWidth={1}
            borderStyle="solid"
            marginBottom={8}
          >
            <Text tag="span" variant="body-3" color="tertiary">
              {t('status')}
            </Text>
            <Text tag="span" variant="body-3" color={status.color}>
              {status.text}
            </Text>
          </Stack>
          <Stack flexDirection="column" gap={2}>
            {events.map(i => {
              const { kind } = i.event;
              return (
                <Stack flexDirection="row" gap={4} key={i.timestamp}>
                  <VerticalLine>
                    {isRequested(kind) || isSubmitted(kind) ? (
                      <IcoUpload16 />
                    ) : null}
                    {isAssigned(kind) ? <IcoUser16 /> : null}
                    {isRetracted(kind) ? <IcoClose16 /> : null}
                    {isReviewed(kind) ? <IcoPencil16 /> : null}
                  </VerticalLine>
                  <Stack flexDirection="column" flexGrow={1}>
                    <Stack
                      flexDirection="row"
                      justifyContent="space-between"
                      paddingBottom={isReviewed(kind) ? 2 : 6}
                    >
                      <div>
                        {!isAssigned(kind) ? (
                          <Text tag="strong" variant="label-3" color="primary">
                            {getActorName(i)}&nbsp;
                          </Text>
                        ) : null}
                        {i.actor?.org &&
                        (isRequested(kind) ||
                          isRetracted(kind) ||
                          isSubmitted(kind) ||
                          isReviewed(kind)) ? (
                          <From span={t('from')} strong={i.actor.org} />
                        ) : null}
                        <Text tag="span" variant="body-3" color="tertiary">
                          {isRequested(kind)
                            ? `${t('doc.requested-the')} `
                            : ''}
                          {isAssigned(kind) ? `${t('assigned-to')} ` : ''}
                          {isRetracted(kind)
                            ? `${t('doc.retracted-document')} `
                            : ''}
                          {isSubmitted(kind)
                            ? `${t('doc.uploaded-document')} · `
                            : ''}
                          {isReviewed(kind)
                            ? `${t('doc.reviewed-document')} `
                            : ''}
                        </Text>
                        {isSubmitted(kind) ? (
                          <LinkButton
                            onClick={() =>
                              onViewSubmissionClick(docId, submissionId(i))
                            }
                            variant="label-3"
                          >
                            {t('doc.view-submission')}
                          </LinkButton>
                        ) : null}
                        <Text tag="strong" variant="label-3" color="primary">
                          {isRequested(kind) && docName(i)
                            ? `${docName(i)} `
                            : ''}
                          {isAssigned(kind)
                            ? `${getEndName(i) || t('no-assignee')} `
                            : ''}
                        </Text>
                        {isAssigned(kind) && endOrg(i) ? (
                          <From span={t('from')} strong={endOrg(i)} />
                        ) : null}
                      </div>
                      <Text
                        tag="span"
                        variant="body-4"
                        color="tertiary"
                        flexShrink={0}
                      >
                        {dateFormatter(lang, i.timestamp)}
                      </Text>
                    </Stack>
                    {isReviewed(kind) ? (
                      <div>
                        <TextWithSideMargin
                          tag="span"
                          variant="label-3"
                          color={isRejected(decision(i)) ? 'error' : 'success'}
                        >
                          ·
                        </TextWithSideMargin>
                        <Text
                          tag="span"
                          variant="body-3"
                          color={isRejected(decision(i)) ? 'error' : 'success'}
                        >
                          {isRejected(decision(i))
                            ? t('doc.rejected')
                            : t('doc.accepted')}
                        </Text>
                        {note(i) ? (
                          <TextWithPadding
                            tag="p"
                            variant="body-3"
                            color="primary"
                            backgroundColor="secondary"
                            marginTop={5}
                            marginBottom={5}
                          >
                            ”{note(i)}”
                          </TextWithPadding>
                        ) : null}
                      </div>
                    ) : null}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </>
      )}
    </Drawer>
  ) : null;
};

const VerticalLine = styled.div`
  ${({ theme }) => css`
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: ${theme.spacing[7]};
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      border-left: 2px solid ${theme.color.senary};
    }
  `};
`;

const From = ({
  span,
  strong,
}: {
  span: string;
  strong: string;
}): JSX.Element => (
  <>
    <Text tag="span" variant="body-3" color="tertiary">
      {span}&nbsp;
    </Text>
    <Text tag="strong" variant="label-3" color="primary">
      {strong}&nbsp;
    </Text>
  </>
);

const TextWithSideMargin = styled(Text)`
  margin: 0 10px;
`;

const TextWithPadding = styled(Text)`
  ${({ theme }) => css`
    padding: 6px ${theme.spacing[4]};
  `};
`;

export default DrawerTimeline;
