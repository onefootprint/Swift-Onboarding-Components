import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import Image from 'next/image';
import React from 'react';

type HoverableImageProps = {
  src: string;
};

const HoverableImage = ({ src }: HoverableImageProps) => {
  const { t } = useTranslation('pages.entity.fieldset.document.drawer.uploads');

  return (
    <StyledImage
      src={src}
      width={0}
      height={0}
      style={{ width: '50%', height: 'auto' }}
      alt={t('image-alt')}
    />
  );
};

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    position: relative;
    margin-top: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[8]};
    object-fit: contain;
    border-radius: ${theme.borderRadius.default};
  `};
`;

export default HoverableImage;
