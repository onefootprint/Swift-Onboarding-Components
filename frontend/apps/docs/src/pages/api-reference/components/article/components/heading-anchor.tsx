import { IcoLink16 } from '@onefootprint/icons';
import { Link } from 'react-scroll';
import styled, { css } from 'styled-components';
import { ARTICLES_CONTAINER_ID } from '../../articles';

type HeadingAnchorProps = {
  id: string;
  children: React.ReactNode;
};

const HeadingAnchor = ({ id, children }: HeadingAnchorProps) => {
  return (
    <Anchor id={id} to={id} containerId={ARTICLES_CONTAINER_ID} href={`#${id}`} rel="noopener noreferrer">
      {children}
      <StyledIcoLink />
    </Anchor>
  );
};

const Anchor = styled(Link)`
  ${({ theme }) => css`
    color: currentColor;
    text-decoration: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 0;
    flex-shrink: 1;
    overflow: hidden;

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

const StyledIcoLink = styled(IcoLink16)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]};
  `}
`;

export default HeadingAnchor;
