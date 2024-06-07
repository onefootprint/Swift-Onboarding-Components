import { Button, Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../layout/components/header-title';
import NavigationHeader from '../layout/components/navigation-header';

type ConfirmCollectedDataProps = {
  title: string;
  subtitle: string;
  cta: string;
  onClickPrev: () => void;
  onClickConfirm: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  headerVariant?: 'back' | 'close';
};

const ConfirmCollectedData = ({
  title,
  subtitle,
  cta,
  onClickPrev,
  onClickConfirm,
  isLoading,
  children,
  headerVariant = 'back',
}: ConfirmCollectedDataProps) => (
  <>
    <NavigationHeader leftButton={{ variant: headerVariant, onBack: onClickPrev }} />
    <Stack gap={8} direction="column">
      <HeaderTitle title={title} subtitle={subtitle} />
      <SectionsContainer>{children}</SectionsContainer>
      <Button fullWidth onClick={onClickConfirm} loading={isLoading} size="large">
        {cta}
      </Button>
    </Stack>
  </>
);

const SectionsContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[5]};
  `}
`;

export default ConfirmCollectedData;
