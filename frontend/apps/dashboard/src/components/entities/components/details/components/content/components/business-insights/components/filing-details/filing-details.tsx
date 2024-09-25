import { IcoArrowTopRight16 } from '@onefootprint/icons';
import type { SOSFiling } from '@onefootprint/types';
import { Dialog, LinkButton, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useFilingStatusText from '../../hooks/use-filing-status-text';
import LineItem from '../line-item';
import statusVariant from '../sos-filings/constants';

export type FilingDetailsProps = {
  filing: SOSFiling;
  onClose: () => void;
};

const FilingDetails = ({ filing, onClose }: FilingDetailsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.sos-filings',
  });
  const statusT = useFilingStatusText();
  const {
    state,
    status,
    jurisdiction,
    subStatus,
    name,
    entityType,
    addresses,
    registeredAgent,
    registrationDate,
    fileNumber,
    source,
  } = filing;

  return (
    <Dialog onClose={onClose} open title={t('title')}>
      <Container>
        <Header>
          <Text variant="label-3">{state}</Text>
          {status && (
            <Text variant="label-3" color={statusVariant[status]}>
              {statusT(status)}
            </Text>
          )}
        </Header>
        <Content>
          <Section>
            <Title>{t('dialog.status-details.title')}</Title>
            <LineItem leftText={t('dialog.status-details.jurisdiction')} rightText={jurisdiction} />
            <LineItem leftText={t('dialog.status-details.sub-status')} rightText={subStatus} />
          </Section>
          <Section>
            <Title>{t('dialog.entity-details.title')}</Title>
            <LineItem leftText={t('dialog.entity-details.name')} rightText={name} />
            <LineItem leftText={t('dialog.entity-details.entity-type')} rightText={entityType} />
          </Section>
          <Section>
            <Title>{t('dialog.addresses.title')}</Title>
            {addresses.map(address => (
              <Text variant="body-3">{address}</Text>
            ))}
          </Section>
          <Section>
            <Title>{t('dialog.people.title')}</Title>
            <LineItem leftText={t('dialog.people.agent')} rightText={registeredAgent} />
          </Section>
          <Section>
            <Title>{t('dialog.filing-details.title')}</Title>
            <LineItem leftText={t('dialog.filing-details.date')} rightText={registrationDate} />
            <LineItem leftText={t('dialog.filing-details.file-number')} rightText={fileNumber} />
            {source ? (
              <LineItem
                leftText={t('dialog.filing-details.source')}
                customRight={
                  <LinkButton href={source} iconComponent={IcoArrowTopRight16}>
                    {source}
                  </LinkButton>
                }
              />
            ) : (
              <LineItem leftText={t('dialog.filing-details.source')} rightText={source} />
            )}
          </Section>
        </Content>
      </Container>
    </Dialog>
  );
};

const Container = styled.fieldset`
  ${({ theme }) => css`
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

const Content = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[8]};
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
  `};
`;

const Section = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `};
`;

const Title = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    padding-bottom: ${theme.spacing[2]};
  `};
`;

export default FilingDetails;
