import Image from 'next/image';
import styled, { css } from 'styled-components';

type StyledImageProps = {
  alt: string;
  src: string;
};

const StyledImage = ({ alt, src }: StyledImageProps) => <Img src={src} width={0} height={0} alt={alt} />;

const Img = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    max-width: 100%;
    width: 100%;
    height: auto;
    object-fit: contain;
  `};
`;

export default StyledImage;
