import { IcoClose16, IcoPencil16, IcoUpload16, IcoUser16 } from '@onefootprint/icons';
import { Drawer, LinkButton, Stack, Text } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import React, { useEffect, useState } from 'react';
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
const assignedToOrg = getOr<string>('', 'event.data.assignedTo.org');
const dataName = getOr<string>('', 'event.data.name');
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

const isOrgRequired = (kind: string): boolean =>
  [isRequested, isRetracted, isSubmitted, isReviewed].some(fn => fn(kind));

const getPersonalAction = (t: TFunction<'common'>, kind: string): string => {
  if (isRequested(kind)) return `${t('doc.requested')} `;
  if (isAssigned(kind)) return `${t('assigned-to')} `;
  if (isRetracted(kind)) return `${t('doc.retracted-document')} `;
  if (isSubmitted(kind)) return `${t('doc.uploaded-document')} · `;
  if (isReviewed(kind)) return `${t('doc.reviewed-document')} `;
  return '';
};
const getNonPersonal = (t: TFunction<'common'>, kind: string): string => {
  if (isRequested(kind)) return ` ${t('doc.automatically-requested')}`;
  if (isAssigned(kind)) return ` ${t('doc.automatically-assigned')}`;
  if (isRetracted(kind)) return ` ${t('doc.automatically-retracted')}`;
  if (isSubmitted(kind)) return ` ${t('doc.automatically-uploaded')}`;
  if (isReviewed(kind)) return ` ${t('doc.automatically-reviewed')}`;
  return '';
};

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const status = getDocStatus(t, docStatus);

  useEffect(() => {
    if (!partnerId || !docId) return;

    setIsLoading(true);
    getPartnerPartnershipsDocumentsEvents(partnerId, docId)
      .then(list => list.sort(sortByTimestampDesc))
      .then(setEvents)
      .finally(() => setIsLoading(false));
  }, [partnerId, docId]);

  const handleClose = () => {
    onClose();
  };

  return isOpen ? (
    <Drawer onClickOutside={handleClose} onClose={handleClose} open={isOpen} title={t('doc.document-history')}>
      {isLoading ? (
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
          <Stack flexDirection="column">
            {events.map(i => {
              const { kind } = i.event;
              const actorName = getActorName(i);
              const actorOrg = i.actor?.org;
              const docName = dataName(i);

              return (
                <Stack flexDirection="row" gap={4} key={i.timestamp}>
                  <VerticalLine>
                    {isRequested(kind) || isSubmitted(kind) ? <IcoUpload16 /> : null}
                    {isAssigned(kind) ? <IcoUser16 /> : null}
                    {isRetracted(kind) ? <IcoClose16 /> : null}
                    {isReviewed(kind) ? <IcoPencil16 /> : null}
                  </VerticalLine>
                  <Stack flexDirection="column" flexGrow={1}>
                    <Stack flexDirection="row" justifyContent="space-between" paddingBottom={isReviewed(kind) ? 2 : 6}>
                      <DivWithRightPadding>
                        {actorName ? (
                          <>
                            {!isAssigned(kind) ? (
                              <Text tag="strong" variant="label-3" color="primary" display="inline-block">
                                {actorName}&nbsp;
                              </Text>
                            ) : null}
                            {isOrgRequired(kind) ? <From span={t('from')} strong={actorOrg} /> : null}
                            <Text tag="span" variant="body-3" color="tertiary">
                              {getPersonalAction(t, kind)}
                            </Text>
                          </>
                        ) : null}
                        {isSubmitted(kind) ? (
                          <LinkButton variant="label-3" onClick={() => onViewSubmissionClick(docId, submissionId(i))}>
                            {t('doc.view-submission')}
                          </LinkButton>
                        ) : null}
                        <Text tag="strong" variant="label-3" color="primary">
                          {isRequested(kind) && docName ? `${docName} ` : ''}
                          {isAssigned(kind) ? `${getEndName(i) || t('no-assignee')} ` : ''}
                        </Text>
                        {isAssigned(kind) ? <From span={t('from')} strong={assignedToOrg(i)} /> : null}
                        {!actorName ? (
                          <Text tag="span" variant="body-3" color="tertiary">
                            {getNonPersonal(t, kind)}
                          </Text>
                        ) : null}
                      </DivWithRightPadding>
                      <Text tag="span" variant="body-4" color="tertiary" flexShrink={0}>
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
                        <Text tag="span" variant="body-3" color={isRejected(decision(i)) ? 'error' : 'success'}>
                          {isRejected(decision(i)) ? t('doc.rejected') : t('doc.accepted')}
                        </Text>
                        {note(i) ? (
                          <TextWithPadding
                            tag="p"
                            variant="body-3"
                            color="primary"
                            backgroundColor="secondary"
                            marginTop={5}
                            marginBottom={5}
                            borderRadius="default"
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

const DivWithRightPadding = styled.div`
  padding-right: 20px;
`;

const VerticalLine = styled.div`
  ${({ theme }) => css`
    padding-top: 3px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 28px;
      bottom: 4px;
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
  span?: string;
  strong?: string;
}): JSX.Element | null =>
  span && strong ? (
    <>
      <Text tag="span" variant="body-3" color="tertiary" display="inline-block">
        {span}&nbsp;
      </Text>
      <Text tag="strong" variant="label-3" color="primary" display="inline-block">
        {strong}&nbsp;
      </Text>
    </>
  ) : null;

const TextWithSideMargin = styled(Text)`
  margin: 0 10px;
`;

const TextWithPadding = styled(Text)`
  ${({ theme }) => css`
    padding: 6px ${theme.spacing[4]};
  `};
`;

export default DrawerTimeline;
