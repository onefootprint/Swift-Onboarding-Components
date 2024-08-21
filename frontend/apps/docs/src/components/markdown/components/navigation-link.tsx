import type { Color, FontFamily, FontVariant } from '@onefootprint/design-tokens';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import { Stack, createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import styled, { css, type WebTarget } from 'styled-components';

type NavigationLinkProps<TLinkProps> = {
  children: string;
  href: string;
  variant?: FontVariant;
  color?: Color;
  fontFamily?: FontFamily;
  LinkElement: WebTarget;
} & TLinkProps;

const NavigationLink = <TLinkProps = {}>({
  children,
  href,
  variant = 'body-3',
  color = 'primary',
  fontFamily = 'default',
  LinkElement = Link,
  ...linkProps
}: NavigationLinkProps<TLinkProps>) => {
  const LinkContainer = styled(LinkElement)`
    ${({ theme }) => css`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      gap: ${theme.spacing[1]};
      background-color: ${theme.backgroundColor.secondary};
      border-radius: ${theme.borderRadius.default};
      padding: ${theme.spacing[1]} ${theme.spacing[1]} ${theme.spacing[1]}
        ${theme.spacing[3]};
      transition: border 0.2s ease-in-out;
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.transparent};

      &:hover {
        border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      }
    `}
  `;

  return (
    <LinkContainer href={href} target="_blank" {...linkProps}>
      <StyledText variant={variant} color={color} fontFamily={fontFamily}>
        {children}
      </StyledText>
      <Stack marginTop={1}>
        <IcoArrowUpRight16 color={color} />
      </Stack>
    </LinkContainer>
  );
};

const StyledText = styled.p<{
  color: Color;
  variant: FontVariant;
  fontFamily: FontFamily;
}>`
  ${({ theme, color, variant, fontFamily }) => css`
    ${createFontStyles(variant, fontFamily)}
    color: ${theme.color[color]};

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

export default NavigationLink;
