import IcoShield24 from 'icons/ico/ico-shield-24';
import React from 'react';
import styled, { css } from 'styled';
import { media, Typography } from 'ui';

type OverlappingTextProps = {
  titleText: string;
  subtitleText: string;
};

const OverlappingText = ({ titleText, subtitleText }: OverlappingTextProps) => (
  <Container>
    <Typography
      variant="heading-3"
      as="h4"
      sx={{ marginBottom: 3, display: 'flex' }}
    >
      <IconContainer>
        <IcoShield24 color="quaternary" />
      </IconContainer>
      {subtitleText}
    </Typography>
    <Typography variant="display-1" as="h3">
      {titleText}
    </Typography>
  </Container>
);

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  position: absolute;
  text-align: center;

  ${media.between('xs', 'sm')`
    max-width: 50%;
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.tertiary};
    border-radius: ${theme.borderRadius[3]}px;
    display: flex;
    height: 28px;
    justify-content: center;
    margin-right: ${theme.spacing[3]}px;
    width: 28px;
  `}
`;

export default OverlappingText;
