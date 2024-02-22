import { COUNTRIES } from '@onefootprint/global-constants';
import { IcoCheckSmall16, IcoInfo16 } from '@onefootprint/icons';
import {
  Button,
  Grid,
  media,
  Stack,
  Tooltip,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';

const SupportedIdDocuments = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.supported-id-documents',
  });

  const handleClick = () => {
    window.open('mailto:hello@onefootprint.com');
  };

  return (
    <>
      <SEO title={t('html-title')} slug="/supported-id-documents" />
      <Container>
        <Grid.Container gap={5} marginBottom={10} textAlign="center">
          <Typography variant="display-2" as="h1">
            {t('title')}
          </Typography>
          <Typography variant="display-4" as="h1">
            {t('subtitle')}
          </Typography>
        </Grid.Container>
        <Grid.Container
          borderColor="tertiary"
          borderWidth={1}
          borderRadius="default"
          gap={5}
          marginBottom={11}
          overflow="hidden"
        >
          <Grid.Container
            as="th"
            height="40px"
            backgroundColor="secondary"
            columns={[
              'minmax(116px, 2fr)',
              'minmax(80px, 1fr)',
              'minmax(80px, 1fr)',
              'minmax(80px, 1fr)',
            ]}
            borderPosition="bottom"
            borderWidth={1}
            borderColor="tertiary"
            align="center"
          >
            <HeaderCell data-align="left">
              <Typography variant="caption-3" color="secondary" as="h4">
                {t('table-headers.country')}
              </Typography>
            </HeaderCell>
            <HeaderCell>
              <Typography variant="caption-3" color="secondary" as="h4">
                {t('table-headers.passport')}
              </Typography>
            </HeaderCell>
            <HeaderCell>
              <Typography variant="caption-3" color="secondary" as="h4">
                {t('table-headers.id-card.text')}
              </Typography>
              <Tooltip
                text={t('table-headers.id-card.tooltip')}
                position="bottom"
              >
                <Stack>
                  <IcoInfo16 color="secondary" />
                </Stack>
              </Tooltip>
            </HeaderCell>
            <HeaderCell>
              <Typography variant="caption-3" color="secondary" as="h4">
                {t('table-headers.drivers-license')}
              </Typography>
            </HeaderCell>
          </Grid.Container>
          {COUNTRIES.map(({ label, passport, idCard, driversLicense }) => (
            <TableRow
              as="tr"
              height="40px"
              columns={[
                'minmax(116px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr)',
              ]}
              key={label}
              borderPosition="bottom"
              borderWidth={1}
              borderColor="tertiary"
              alignItems="center"
            >
              <TableCell data-align="left">
                <Typography variant="body-3">{label}</Typography>
              </TableCell>
              <TableCell>{passport && <IcoCheckSmall16 />}</TableCell>
              <TableCell>{idCard && <IcoCheckSmall16 />}</TableCell>
              <TableCell>
                {driversLicense ? <IcoCheckSmall16 /> : null}
              </TableCell>
            </TableRow>
          ))}
        </Grid.Container>
        <ContactContainer
          align="center"
          direction="column"
          marginBottom={10}
          textAlign="center"
          backgroundColor="primary"
        >
          <Typography variant="label-1" sx={{ marginBottom: 3 }}>
            {t('contact.title')}
          </Typography>
          <Typography
            color="secondary"
            variant="body-2"
            sx={{ marginBottom: 7 }}
          >
            {t('contact.subtitle')}
          </Typography>
          <Button onClick={handleClick} size="compact">
            {t('contact.cta')}
          </Button>
        </ContactContainer>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    max-width: 800px;
    padding: 0 ${theme.spacing[5]};

    ${media.greaterThan('md')`
      padding: 0;
    `}
  `}
`;

const TableRow = styled(Grid.Container)`
  &:last-of-type {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &[data-align='left'] {
      justify-content: flex-start;
      padding-left: ${theme.spacing[4]};

      ${media.greaterThan('md')`
        padding-left: ${theme.spacing[6]}
      `};
    }
  `}
`;

const HeaderCell = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[2]};
    justify-content: center;
    text-align: center;

    h4 {
      text-transform: uppercase;
    }

    &[data-align='left'] {
      justify-content: flex-start;
      text-align: left;
      padding-left: ${theme.spacing[4]};

      ${media.greaterThan('md')`
        padding-left: ${theme.spacing[6]};
      `}
    }
  `}
`;

const ContactContainer = styled(Stack)`
  ${({ theme }) => css`
    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[11]};
    `};
  `}
`;

export default SupportedIdDocuments;
