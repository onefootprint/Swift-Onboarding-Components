import { useTranslation } from '@onefootprint/hooks';
import { Divider } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';

type EditDataContainerDesktopProps = {
  name: string;
  children: React.ReactNode;
};

const EditDataContainerDesktop = ({
  name,
  children,
}: EditDataContainerDesktopProps) => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKycDataMachine();

  const handlePrev = () => {
    send({ type: 'returnToSummary' });
  };

  return (
    <>
      <NavigationHeader
        button={{ variant: 'back', onClick: handlePrev }}
        content={{ kind: 'static', title: t('edit-sheet.title', { name }) }}
      />
      <StyledDivider />
      <Container>{children}</Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
  `};
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: 0 calc(-1 * ${theme.spacing[7]}) 0;
  `}
`;

export default EditDataContainerDesktop;
