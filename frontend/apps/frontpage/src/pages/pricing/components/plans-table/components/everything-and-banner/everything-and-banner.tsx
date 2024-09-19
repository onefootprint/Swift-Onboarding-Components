import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Plans } from '../../plans-table-types';

type EverythingAndBannerProps = {
  plan: Plans;
};

const EverythingAndBanner = ({ plan }: EverythingAndBannerProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing' });

  return (
    <Container direction="column" gap={2}>
      <Text variant="body-3" color="tertiary">
        {t(`plans.${plan}.everything-and` as ParseKeys<'common'>)}
      </Text>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[2]};
  `}
`;

export default EverythingAndBanner;
