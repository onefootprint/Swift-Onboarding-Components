import { COUNTRIES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckSmall16, IcoInfo16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, media, Stack, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';

import SEO from '../../components/seo';

const SupportedIdDocuments = () => {
  const { t } = useTranslation('pages.supported-id-documents');

  const handleClick = () => {
    window.open('mailto:hello@onefootprint.com');
  };

  return (
    <>
      <SEO title={t('html-title')} slug="/supported-id-documents" />
      <Container>
        <HeroContainer>
          <Typography variant="display-2" as="h1">
            {t('title')}
          </Typography>
          <Typography variant="display-4" as="h1">
            {t('subtitle')}
          </Typography>
        </HeroContainer>
        <TableContainer>
          <TableHeader>
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
          </TableHeader>
          {COUNTRIES.map(({ label, passport, idCard, driversLicense }) => (
            <TableRow key={label}>
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
        </TableContainer>
        <ContactContainer>
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

const HeroContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[10]};
    text-align: center;
  `}
`;

const TableContainer = styled.div`
  ${({ theme }) => css`
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    margin-bottom: ${theme.spacing[11]};
    overflow: hidden;
  `}
`;

const TableRow = styled.tr`
  ${({ theme }) => css`
    height: 40px;
    display: grid;
    grid-template-columns:
      minmax(116px, 2fr)
      minmax(80px, 1fr)
      minmax(80px, 1fr)
      minmax(80px, 1fr);
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    align-items: center;

    &:last-of-type {
      border-bottom: none;
    }
  `}
`;

const TableHeader = styled.div`
  ${({ theme }) => css`
    height: 40px;
    background-color: ${theme.backgroundColor.secondary};
    display: grid;
    grid-template-columns:
      minmax(116px, 2fr)
      minmax(80px, 1fr)
      minmax(80px, 1fr)
      minmax(80px, 1fr);
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    align-items: center;
  `}
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
const ContactContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    margin-bottom: ${theme.spacing[10]};
    text-align: center;
    background-color: ${theme.backgroundColor.primary};

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[11]};
    `};
  `}
`;

export default SupportedIdDocuments;
