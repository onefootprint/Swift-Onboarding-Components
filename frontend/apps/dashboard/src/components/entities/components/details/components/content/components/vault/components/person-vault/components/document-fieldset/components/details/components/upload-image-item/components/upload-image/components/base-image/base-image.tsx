import Image from 'next/image';
import styled, { css } from 'styled-components';

type BaseImageProps = {
  alt: string;
  src: string;
};

const BaseImage = ({ alt, src }: BaseImageProps) => <StyledImage src={src} width={0} height={0} alt={alt} />;

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    max-width: 100%;
    width: 100%;
    height: auto;
    object-fit: contain;
  `};
`;

export default BaseImage;
