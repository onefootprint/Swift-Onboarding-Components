import type { Icon } from '@onefootprint/icons';
import { createFontStyles, Typography } from '@onefootprint/ui';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

type CardProps = {
  title: string;
  subtitle: string;
  iconComponent?: Icon;
  illustration: React.FC<{ isHover: boolean }>;
};

const Card = ({
  title,
  subtitle,
  iconComponent: Icon,
  illustration: Illustration,
}: CardProps) => {
  const hoverRef = useRef(null);
  const isHover = useHover(hoverRef);
  const renderedIcon = Icon && <Icon />;
  const renderedIllustration = Illustration && (
    <Illustration isHover={isHover} />
  );

  return (
    <Container ref={hoverRef} isHover={isHover}>
      <ImageContainer>{renderedIllustration}</ImageContainer>
      <TextContainer>
        <Title>
          {renderedIcon} {title}
        </Title>
        <Typography variant="body-2" color="secondary">
          {subtitle}
        </Typography>
      </TextContainer>
    </Container>
  );
};

const Container = styled.div<{ isHover?: boolean }>`
  ${({ theme, isHover }) => css`
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${isHover ? theme.elevation[2] : theme.elevation[1]};
    transition: box-shadow 0.4s ease-in-out;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    will-change: box-shadow;
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[8]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-2')}
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
  `}
`;

const ImageContainer = styled.div`
  height: 272px;
  width: 100%;
  display: flex;
`;

export default Card;
