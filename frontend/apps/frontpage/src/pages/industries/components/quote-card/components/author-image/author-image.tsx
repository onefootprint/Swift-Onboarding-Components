import { Box } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

interface AuthorImageProps {
  src: string;
  alt: string;
}

const SIZE = 80;

const AuthorImage = ({ src, alt }: AuthorImageProps) => (
  <StyledAuthorImage>
    <Image src={src} alt={alt} width={200} height={200} />
  </StyledAuthorImage>
);

const StyledAuthorImage = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: ${theme.elevation[3]};
    width: ${SIZE}px;
    height: ${SIZE}px;
    transform: rotate(-3deg);
    padding: ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};

    img {
      border-radius: ${theme.borderRadius.default};
      object-fit: cover;
      object-position: center;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
  `}
`;

export default AuthorImage;
