import { FontVariant } from '@onefootprint/design-tokens';
import { IcoLink16 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type HeadingAnchorProps = {
  id: string;
  children: React.ReactNode;
  variant: FontVariant;
  tag: React.ElementType;
};

const HeadingAnchor = ({ id, children, variant, tag }: HeadingAnchorProps) => {
  return (
    <Anchor id={id} href={`#${id}`} rel="noopener noreferrer">
      <Text tag={tag} color="primary" variant={variant}>
        {children}
        <IcoLink16 />
      </Text>
    </Anchor>
  );
};

const Anchor = styled.a`
  ${({ theme }) => css`
    color: currentColor;
    text-decoration: none;

    * {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    @media (hover: hover) {
      &:hover svg {
        opacity: 1;
        transform: translateX(${theme.spacing[2]});
        visibility: visible;
      }
    }

    &:focus svg {
      opacity: 1;
      transform: translateX(${theme.spacing[2]});
      visibility: visible;
    }

    svg {
      transition: all 0.2s;
      transform: translateX(-${theme.spacing[3]});
      opacity: 0;
      visibility: hidden;
    }
  `};
`;

export default HeadingAnchor;
