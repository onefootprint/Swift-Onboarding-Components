import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { IcoHelp24 } from '@onefootprint/icons';
import { Button, Text } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactDialog from 'src/components/contact-dialog';
import styled, { css } from 'styled-components';

const GET_FORM_URL = 'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

const Banner = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home.banner' });
  const [showDialog, setShowDialog] = useState(false);

  const handleClickTrigger = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <Container>
      <TextContainer>
        <TitleContainer>
          <IcoHelp24 />
          <Text variant="label-2">{t('title')}</Text>
        </TitleContainer>
        <Text variant="body-3" color="secondary">
          {t('subtitle')}
        </Text>
      </TextContainer>
      <Buttons>
        <Link href={`${DASHBOARD_BASE_URL}/sign-up`}>
          <Button variant="primary">{t('get-started')}</Button>
        </Link>
        <Button variant="secondary" onClick={handleClickTrigger}>
          {t('contact-us')}
        </Button>
      </Buttons>
      <ContactDialog url={GET_FORM_URL} open={showDialog} onClose={handleClose} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]};
    background-color: ${theme.backgroundColor.secondary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    margin-top: ${theme.spacing[9]};
    position: relative;
    overflow: hidden;
    border-radius: ${theme.borderRadius.default};
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
  `}
`;

const Buttons = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};

    a {
      text-decoration: none;
    }
  `}
`;

export default Banner;
