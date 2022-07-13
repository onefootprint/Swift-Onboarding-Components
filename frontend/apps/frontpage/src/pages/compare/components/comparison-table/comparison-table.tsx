import { useTranslation } from 'hooks';
import IcoCheck24 from 'icons/ico/ico-check-24';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

const ComparisonTable = () => {
  const { t } = useTranslation('pages.compare.table');

  const header = [
    '',
    t('companies.footprint'),
    t('companies.persona'),
    t('companies.alloy'),
    t('companies.unit'),
    t('companies.vgs'),
  ];
  const kyc = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: true },
    { key: 'Alloy', value: true },
    { key: 'Unit', value: true },
    { key: 'VGS', value: false },
  ];
  const tokenization = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'Unit', value: false },
    { key: 'VGS', value: true },
  ];
  const piiVaulting = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'Unit', value: false },
    { key: 'VGS', value: true },
  ];
  const liveness = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: true },
    { key: 'Alloy', value: false },
    { key: 'Unit', value: false },
    { key: 'VGS', value: false },
  ];
  const faceId = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'Unit', value: false },
    { key: 'VGS', value: false },
  ];
  const oneClick = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'Unit', value: false },
    { key: 'VGS', value: false },
  ];
  const zeroTrustSecurity = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: false },
    { key: 'Alloy', value: false },
    { key: 'Unit', value: false },
    { key: 'VGS', value: true },
  ];
  const simpleIntegration = [
    { key: 'Footprint', value: true },
    { key: 'Persona', value: true },
    { key: 'Alloy', value: false },
    { key: 'Unit', value: false },
    { key: 'VGS', value: false },
  ];
  const fancyAI = [
    { key: 'Footprint', value: false },
    { key: 'Persona', value: true },
    { key: 'Alloy', value: true },
    { key: 'Unit', value: true },
    { key: 'VGS', value: false },
  ];

  return (
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
  );
};

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
