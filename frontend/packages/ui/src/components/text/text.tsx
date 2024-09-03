import type { FontVariant } from '@onefootprint/design-tokens';
import { forwardRef, useEffect, useRef, useState } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled-components';
import type { BoxPrimitives } from '../box';
import Box from '../box';
import variantMapping from './text.constants';

export type TextProps = {
  truncate?: boolean;
  variant: FontVariant;
} & BoxPrimitives<HTMLParagraphElement>;

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ tag = 'p', children, truncate, variant, color = 'primary', title, ...props }: TextProps, ref) => {
    const [isEllipsisActive, setIsEllipsisActive] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    const textTitle = title || (typeof children === 'string' ? children : undefined);

    useEffect(() => {
      if (!truncate) {
        return;
      }

      const element = textRef.current;

      if (element) {
        setIsEllipsisActive(element.offsetWidth < element.scrollWidth || element.offsetHeight < element.scrollHeight);
      } else {
        setIsEllipsisActive(false);
      }
    }, [truncate]);

    return (
      <StyledText
        {...props}
        data-truncate={truncate}
        data-variant={variant}
        ref={mergeRefs([textRef, ref])}
        tag={tag || variantMapping[variant] || 'p'}
        typography={variant}
        color={color}
        title={isEllipsisActive ? textTitle : undefined}
      >
        {children}
      </StyledText>
    );
  },
);

const StyledText = styled(Box)`
  ${({ theme }) => css`
    &[data-truncate='true'] {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    a {
      color: ${theme.components.link.color};
      text-decoration: none;

      @media (hover: hover) {
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `}
`;

export default Text;
