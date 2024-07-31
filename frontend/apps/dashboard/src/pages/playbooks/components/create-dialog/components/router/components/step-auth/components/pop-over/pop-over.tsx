import type { Color, FontVariant } from '@onefootprint/design-tokens';
import { Stack, Text } from '@onefootprint/ui';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import Image from 'next/image';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

type TriggerVariantsProps = {
  variant: FontVariant;
  color?: Color;
};

type PopOverProps = {
  label: string;
  content: string;
  videoSrc?: string;
  triggerVariants: TriggerVariantsProps;
};

const PopOver = ({ label, content, triggerVariants, videoSrc }: PopOverProps) => {
  const hoverRef = useRef(null);
  const isHovered = useHover(hoverRef);

  return (
    <PopoverPrimitive.Root>
      <Trigger ref={hoverRef} isHovered={isHovered}>
        <Text variant={triggerVariants.variant} color={isHovered ? 'primary' : triggerVariants.color}>
          {label}
        </Text>
      </Trigger>
      <PopoverPrimitive.Content asChild side="top">
        <Container gap={5} direction="column" align="start">
          {videoSrc && (
            <VideoContainer>
              <Image src={videoSrc} alt="video" height={604} width={800} />
            </VideoContainer>
          )}
          <Text variant="body-4" color="secondary">
            {content}
          </Text>
          <PopoverPrimitive.Arrow />
        </Container>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
};

const VideoContainer = styled(Stack)`
  ${({ theme }) => css`
    width: 100%;
    height: 220px;
    border-radius: calc(${theme.borderRadius.default} - 1 px);
    overflow: hidden;
    background-color: black;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  `}
`;

const Trigger = styled(PopoverPrimitive.Trigger)<{
  isHovered: boolean;
}>`
  ${({ theme, isHovered }) => css`
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing[1]};
    position: relative;

    &:after {
      content: "";
      position: absolute;
      height: ${theme.spacing[1]};
      width: 100%;
      border-top: ${theme.borderWidth[1]} dashed
        ${isHovered ? theme.borderColor.primary : theme.borderColor.tertiary};
      bottom: -3px;
    }
  `}
`;

const Container = styled(Stack)`
  ${({ theme }) => css`
    box-shadow: ${theme.elevation[3]};
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[5]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    max-width: 452px;
    white-space: pre-line;

    p:not(:last-child) {
      margin-bottom: ${theme.spacing[3]};
    }
  `}
`;

export default PopOver;
