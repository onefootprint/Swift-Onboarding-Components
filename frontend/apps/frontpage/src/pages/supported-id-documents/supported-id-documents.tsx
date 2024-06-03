import { COUNTRIES } from '@onefootprint/global-constants';
import { IcoCheckSmall16, IcoInfo16 } from '@onefootprint/icons';
import {
  createFontStyles,
  Grid,
  media,
  Stack,
  Text,
  Tooltip,
} from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import ContactUsBanner from './components/contact-us-banner';

const SupportedIdDocuments = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.supported-id-documents',
  });

  const columnDimensions =
    'minmax(116px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr)';

  const headerOptions = [
    {
      key: 'country',
      value: t('table-headers.country'),
    },
    {
      key: 'passport',
      value: t('table-headers.passport'),
    },
    {
      key: 'id-card',
      value: t('table-headers.id-card.text'),
      tooltip: t('table-headers.id-card.tooltip'),
    },
    {
      key: 'drivers-license',
      value: t('table-headers.drivers-license'),
    },
  ];

  return (
    <>
      <SEO
        title={t('html-title')}
        description={t('html-description')}
        slug="/supported-id-documents"
      />
      <Container>
        <Grid.Container gap={5} marginBottom={10} textAlign="center">
          <Text variant="display-2" tag="h1">
            {t('title')}
          </Text>
          <Text variant="display-4" tag="h1">
            {t('subtitle')}
          </Text>
        </Grid.Container>
        <Grid.Container
          borderColor="tertiary"
          borderWidth={1}
          borderRadius="default"
          marginBottom={11}
          overflow="hidden"
        >
          <Grid.Container
            height="40px"
            backgroundColor="secondary"
            columns={[columnDimensions]}
            borderPosition="bottom"
            borderWidth={1}
            borderColor="tertiary"
          >
            {headerOptions.map(({ key, value, tooltip }) => (
              <HeaderElement
                key={key}
                data-align={value === 'country' ? 'left' : undefined}
                tag="th"
              >
                {value}
                {tooltip && (
                  <Tooltip text={tooltip} position="bottom">
                    <Stack>
                      <IcoInfo16 color="secondary" />
                    </Stack>
                  </Tooltip>
                )}
              </HeaderElement>
            ))}
          </Grid.Container>
          {COUNTRIES.map(({ label, passport, idCard, driversLicense }) => (
            <TableRow
              as="tr"
              height="40px"
              columns={[columnDimensions]}
              key={label}
              borderPosition="bottom"
              borderWidth={1}
              borderColor="tertiary"
              alignItems="center"
            >
              <TableCell data-align="left">
                <Text variant="body-3">{label}</Text>
              </TableCell>
              <TableCell>{passport && <IcoCheckSmall16 />}</TableCell>
              <TableCell>{idCard && <IcoCheckSmall16 />}</TableCell>
              <TableCell>
                {driversLicense ? <IcoCheckSmall16 /> : null}
              </TableCell>
            </TableRow>
          ))}
        </Grid.Container>
        <ContactUsBanner
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
          cta={t('contact.cta')}
        />
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

    &[data-align='left'] {
      justify-content: flex-start;
      padding-left: ${theme.spacing[4]};

      ${media.greaterThan('md')`
        padding-left: ${theme.spacing[6]}
      `};
    }
  `}
`;

const HeaderElement = styled(Grid.Item)`
  ${({ theme }) => css`
    ${createFontStyles('caption-3')}
    text-transform: uppercase;
    gap: ${theme.spacing[2]};
    justify-content: center;
    text-align: center;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

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

export default SupportedIdDocuments;
