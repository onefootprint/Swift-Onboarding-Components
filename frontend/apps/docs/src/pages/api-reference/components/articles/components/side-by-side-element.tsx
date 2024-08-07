import { media } from '@onefootprint/ui';
import React from 'react';
import { Element } from 'react-scroll';
import styled, { css } from 'styled-components';

const CONTENT_WIDTH = 1500;

type SideBySideProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  id: string;
};

/** Creates a two-column view with the provided content. When the viewport is too small, rearranges to a one-column view. */
const SideBySideElement = ({ left, right, id }: SideBySideProps) => {
  return (
    // The id here is used to make sure the `spy` property works on react-scroll's Links
    <ElementContainer name={id} id={id} key={id}>
      <Container>
        <LeftColumn>{left}</LeftColumn>
        <RightColumn>{right}</RightColumn>
      </Container>
    </ElementContainer>
  );
};

const ElementContainer = styled(Element)<{ name: string }>`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    width: 100%;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    padding: 0 ${theme.spacing[6]};

    ${media.greaterThan('lg')`
      flex-direction: row;
      max-width: ${CONTENT_WIDTH}px;
    `}
  `}
`;

const LeftColumn = styled.div`
  ${({ theme }) => css`
    padding-bottom: ${theme.spacing[7]};
    width: 100%;

    ${media.greaterThan('lg')`
      padding-right: ${theme.spacing[8]};
      width: 60%;
    `}
  `}
`;

const RightColumn = styled.div`
  width: 100%;

  ${media.greaterThan('lg')`
    width: 40%;
  `}
`;

export default SideBySideElement;
