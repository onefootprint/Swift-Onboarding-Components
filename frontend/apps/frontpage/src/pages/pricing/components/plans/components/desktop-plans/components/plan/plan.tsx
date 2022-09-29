import { IcoCheckCircle24 } from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, Typography } from 'ui';

type Feature =
  | 'accessControl'
  | 'auditLogs'
  | 'dashboard'
  | 'encryptionAndTokenization'
  | 'faceId'
  | 'firstYearFree'
  | 'idvKyc'
  | 'isolatedCompute'
  | 'nitroEnclaves'
  | 'oneClick';

type PlanProps = {
  cta: string;
  features: Record<Feature, boolean>;
  onCtaClick: () => void;
  price: string;
  subtitle: string;
  title: string;
};

const Plan = ({
  title,
  subtitle,
  price,
  cta,
  onCtaClick,
  features,
}: PlanProps) => (
  <>
    <header>
      <Typography variant="heading-3" sx={{ marginBottom: 3 }} as="h3">
        {title}
      </Typography>
      <Content>
        <Typography color="secondary" sx={{ marginBottom: 7 }} variant="body-1">
          {subtitle}
        </Typography>
        <Typography variant="label-2" color="success">
          {price}
        </Typography>
      </Content>
      <Button fullWidth onClick={onCtaClick} size="compact">
        {cta}
      </Button>
    </header>
    {availableFeatures.map(feature => (
      <div>{features[feature] ? <IcoCheckCircle24 /> : null}</div>
    ))}
  </>
);

// The order IS important, so do not change it, unless you know what you are doing.
const availableFeatures: Feature[] = [
  'nitroEnclaves',
  'isolatedCompute',
  'encryptionAndTokenization',
  'accessControl',
  'auditLogs',
  'idvKyc',
  'faceId',
  'dashboard',
  'oneClick',
  'firstYearFree',
];

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: 152px;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]}px;
  `}
`;

export default Plan;
