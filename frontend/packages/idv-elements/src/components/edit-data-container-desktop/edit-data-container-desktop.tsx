import { Divider } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import NavigationHeader from '../navigation-header';

type EditDataContainerDesktopProps = {
  title: string;
  children: React.ReactNode;
  onClickPrev: () => void;
};

const EditDataContainerDesktop = ({
  title,
  children,
  onClickPrev,
}: EditDataContainerDesktopProps) => (
  <>
    <NavigationHeader
      button={{ variant: 'back', onClick: onClickPrev }}
      content={{ kind: 'static', title }}
    />
    <StyledDivider />
    <Container>{children}</Container>
  </>
);

const Container = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
  `};
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    width: calc(100% + (2 * ${theme.spacing[7]}));
    margin-left: calc(-1 * ${theme.spacing[7]});
    margin-right: calc(-1 * ${theme.spacing[7]});
  `}
`;

export default EditDataContainerDesktop;
