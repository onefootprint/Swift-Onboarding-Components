import type { ParsedUrlQuery } from 'querystring';
import { IcoClock16 } from '@onefootprint/icons';
import { Button, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { WithEntityProps } from '@/entities/components/details/components/with-entity';
import useCurrentEntityTimeline from '@/entities/components/details/hooks/use-current-entity-timeline';
import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import useEntityVault, { type VaultType } from '@/entities/hooks/use-entity-vault';

import TimelineItemTime from 'src/components/timeline-item-time';
import getTimelineEventText from '../../utils/get-timeline-event-text';
import { useDecryptControls } from '../vault/components/vault-actions';
import DecryptHistoricalButton from './components/decrypt-historical-button';

type HistoricalBarProps = WithEntityProps & {
  seqno: string | undefined;
};

const HistoricalBar = ({ entity, seqno }: HistoricalBarProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'historical-kyc-bar',
  });
  const id = useEntityId();
  const router = useRouter();
  const decryptControls = useDecryptControls();
  const { updateForHistorical } = useEntityVault(id, entity);
  const timelineQuery = useCurrentEntityTimeline();
  const shownHistoricalEvent = timelineQuery.data ? timelineQuery.data.find(event => `${event.seqno}` === seqno) : null;

  const removeHistoricalFromVault = () => {
    const vaultsAndTransforms: VaultType = {
      vault: {},
      transforms: {},
      dataKinds: {},
    };
    entity.data.forEach(attribute => {
      vaultsAndTransforms.vault[attribute.identifier] = attribute.value;
      vaultsAndTransforms.transforms[attribute.identifier] = attribute.transforms;
      vaultsAndTransforms.dataKinds[attribute.identifier] = attribute.dataKind;
    });
    updateForHistorical(vaultsAndTransforms);
  };

  const removeSeqnoFromQuery = () => {
    const { seqno, ...restQuery } = router.query as ParsedUrlQuery;
    router.push({
      pathname: `/users/${id}`,
      query: restQuery,
    });
  };

  const handleExitHistorical = () => {
    removeHistoricalFromVault();
    removeSeqnoFromQuery();
  };

  return (
    <Container>
      <Stack direction="column" gap={3}>
        <Stack direction="column" gap={2}>
          <Stack gap={2} align="center">
            <IcoClock16 />
            <Text variant="label-3">{t('title')}</Text>
          </Stack>
          {shownHistoricalEvent && (
            <>
              <Text variant="body-3" color="tertiary">
                {getTimelineEventText(shownHistoricalEvent)}
              </Text>
              <TimeContainer>
                <TimelineItemTime timestamp={shownHistoricalEvent.timestamp} />
              </TimeContainer>
            </>
          )}
        </Stack>
        <Stack gap={3} justify="flex-end" align="center">
          <DecryptHistoricalButton entity={entity} seqno={seqno} />
          {decryptControls.isIdle && <Button onClick={handleExitHistorical}>{t('exit')}</Button>}
        </Stack>
      </Stack>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    position: sticky;
    left: 50%;
    bottom: 0;
    bottom: ${theme.spacing[7]};
    transform: translateX(-50%);
    width: 510px;
    padding: ${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[4]}
      ${theme.spacing[5]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[1]};
  `}
`;

const TimeContainer = styled.div`
  ${({ theme }) => css`
    > div {
      gap: ${theme.spacing[2]};
      p {
        ${createFontStyles('body-3')};
        min-width: 0;
      }
      p:not(:last-child)::after {
        content: ', ';
      }
    }
  `}
`;

export default HistoricalBar;
