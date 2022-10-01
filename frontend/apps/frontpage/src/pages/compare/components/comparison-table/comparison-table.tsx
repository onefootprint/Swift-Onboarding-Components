import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck24 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const ComparisonTable = () => {
  const { t } = useTranslation('pages.compare.table');

  const header = [
    '',
    t('companies.footprint'),
    t('companies.persona'),
    t('companies.alloy'),
    t('companies.vgs'),
  ];
  const kyc = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: true },
    { key: 'Alloy', value: true },
    { key: 'VGS', value: false },
  ];
  const tokenization = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'VGS', value: true },
  ];
  const piiVaulting = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'VGS', value: true },
  ];
  const accessControl = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'VGS', value: false },
  ];
  const liveness = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: true },
    { key: 'Alloy', value: false },
    { key: 'VGS', value: false },
  ];
  const faceId = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'VGS', value: false },
  ];
  const oneClick = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'VGS', value: false },
  ];
  const zeroTrustSecurity = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'VGS', value: true },
  ];
  const simpleIntegration = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: true },
    { key: 'Alloy', value: false },
    { key: 'VGS', value: false },
  ];
  const fancyAI = [
    { key: 'Footprint', value: false },
    { key: 'Persona', value: true },
    { key: 'Alloy', value: true },
    { key: 'VGS', value: false },
  ];

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            {header.map(text => (
              <th key={text}>
                <Typography color="primary" variant="label-3">
                  {text}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.kyc')}
              </Typography>
            </td>
            {kyc.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.tokenization')}
              </Typography>
            </td>
            {tokenization.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.piiVaulting')}
              </Typography>
            </td>
            {piiVaulting.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.accessControl')}
              </Typography>
            </td>
            {accessControl.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.liveness')}
              </Typography>
            </td>
            {liveness.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.faceId')}
              </Typography>
            </td>
            {faceId.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.oneClick')}
              </Typography>
            </td>
            {oneClick.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.zeroTrustSecurity')}
              </Typography>
            </td>
            {zeroTrustSecurity.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.simpleIntegration')}
              </Typography>
            </td>
            {simpleIntegration.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
          <tr>
            <td>
              <Typography color="secondary" variant="body-3">
                {t('features.fancyAI')}
              </Typography>
            </td>
            {fancyAI.map(({ key, value }) => (
              <td key={key}>{value ? <IcoCheck24 /> : undefined}</td>
            ))}
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

const Container = styled.div`
  min-width: 590px;
`;

const Table = styled.table`
  ${({ theme }) => css`
    width: 100%;

    th {
      border-bottom: ${theme.borderWidth[1]}px solid
        ${theme.borderColor.tertiary};
    }

    th,
    td {
      height: 44px;
      text-align: center;
      vertical-align: middle;
      width: 16%;

      &:first-child {
        padding-left: ${theme.spacing[5]}px;
        text-align: left;
        width: 20%;
      }
    }

    tbody {
      tr:nth-child(even) {
        background: ${theme.backgroundColor.secondary};
      }
    }
  `}
`;

export default ComparisonTable;
