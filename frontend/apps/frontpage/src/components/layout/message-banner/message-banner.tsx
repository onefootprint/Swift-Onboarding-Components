import { IcoCloseSmall16 } from '@onefootprint/icons';
import { media, Portal, Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type MessageBannerProps = {
  onClose: () => void;
  articleUrl: string;
  text: string;
};

export const CASE_STUDY_BANNER_PORTAL_ID = 'banner-portal';

const MessageBanner = ({ onClose, articleUrl, text }: MessageBannerProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.message-banner',
  });

  return (
    <Portal selector={`#${CASE_STUDY_BANNER_PORTAL_ID}`}>
      <Container>
        <Text variant="label-3">
          {text}
          <StyledLink href={articleUrl}>{t('cta')}</StyledLink>
        </Text>
        <CloseButtonContainer onClick={onClose}>
          <IcoCloseSmall16 />
        </CloseButtonContainer>
      </Container>
    </Portal>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    align-items: center;
    justify-content: center;
    display: inline-flex;
    position: relative;
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[3]} ${theme.spacing[9]};
    text-align: center;
    width: 100%;

    ${media.greaterThan('md')`
      flex-direction: row;
      height: ${theme.spacing[9]};
    `}
  `}
`;

const CloseButtonContainer = styled.button`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${theme.spacing[7]};
    width: ${theme.spacing[7]};
    position: absolute;
    right: ${theme.spacing[5]};
    top: 50%;
    transform: translateY(-50%);
  `}
`;

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[3]};
  `}
`;

export default MessageBanner;
