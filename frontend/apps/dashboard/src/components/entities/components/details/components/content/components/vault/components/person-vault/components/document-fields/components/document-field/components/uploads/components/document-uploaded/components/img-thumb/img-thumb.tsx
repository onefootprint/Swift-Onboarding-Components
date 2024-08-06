import { IcoCheckSmall16, IcoCloseSmall16 } from '@onefootprint/icons';
import { Box } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type ImgThumbProps = {
  src: string;
  isSuccess: boolean;
};

const ImgThumb = ({ src, isSuccess }: ImgThumbProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.uploads',
  });
  return (
    <Box position="relative" width="80%">
      <StyledImage src={src} width={0} height={0} alt={t('image-alt')} />
      <IconContainer data-success={isSuccess}>
        {isSuccess ? <IcoCheckSmall16 color="quinary" /> : <IcoCloseSmall16 color="quinary" />}
      </IconContainer>
    </Box>
  );
};

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    height: 100%;
    object-fit: contain;
    width: 100%;
    cursor: pointer;
  `};
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    --icon-size: 24px;
    align-items: center;
    background-color: ${theme.color.error};
    border-radius: 50%;
    border: 2px solid ${theme.backgroundColor.primary};
    display: flex;
    height: var(--icon-size);
    justify-content: center;
    position: absolute;
    right: calc(var(--icon-size) / 2 * -1);
    top: calc(var(--icon-size) / 2 * -1);
    width: var(--icon-size);

    &[data-success='true'] {
      background-color: ${theme.color.success};
    }
  `};
`;

export default ImgThumb;
