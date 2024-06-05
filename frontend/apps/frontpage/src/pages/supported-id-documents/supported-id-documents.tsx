import { COUNTRIES } from '@onefootprint/global-constants';
import { IcoCheckSmall16, IcoInfo16 } from '@onefootprint/icons';
import {
  Box,
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
          tag="table"
        >
          <thead>
            <Grid.Container
              backgroundColor="secondary"
              columns={[columnDimensions]}
              borderPosition="bottom"
              borderWidth={1}
              borderColor="tertiary"
              tag="tr"
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
          </thead>
          <tbody>
            {COUNTRIES.map(({ label, passport, idCard, driversLicense }) => (
              <TableRow
                as="tr"
                height="40px"
                $columns={columnDimensions}
                key={label}
              >
                <TableCell data-align="left" tag="th">
                  <Text variant="body-3" textAlign="left">
                    {label}
                  </Text>
                </TableCell>
                <TableCell tag="td">
                  {passport && <IcoCheckSmall16 />}
                </TableCell>
                <TableCell tag="td">{idCard && <IcoCheckSmall16 />}</TableCell>
                <TableCell tag="td">
                  {driversLicense ? <IcoCheckSmall16 /> : null}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
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

const TableRow = styled(Grid.Container)<{ $columns: string }>`
  ${({ $columns, theme }) => css`
    display: grid;
    grid-template-columns: ${$columns};
    height: auto;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    ${media.greaterThan('md')`
      height: 40px;
    `}
  `}

  &:last-of-type {
    border-bottom: none;
  }
`;

const TableCell = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: ${theme.spacing[2]};

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

    overflow: hidden;
    text-overflow: ellipsis;
    height: 40px;

    &[data-align='left'] {
      justify-content: flex-start;
      text-align: left;
      padding-left: ${theme.spacing[4]};

      ${media.greaterThan('md')`
        padding-left: ${theme.spacing[6]};
        white-space: nowrap;
        height: 40px;
      `}
    }
  `}
`;

export default SupportedIdDocuments;
