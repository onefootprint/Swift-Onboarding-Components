import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoHelp24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import ContactDialog from 'src/components/contact-dialog';

const GET_FORM_URL =
  'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

const Banner = () => {
  const { t } = useTranslation('pages.home.banner');
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
          <Typography variant="label-2">{t('title')}</Typography>
        </TitleContainer>
        <Typography variant="body-3" color="secondary">
          {t('subtitle')}
        </Typography>
      </TextContainer>
      <Buttons>
        <Link href={`${DASHBOARD_BASE_URL}/sign-up`}>
          <Button variant="primary" size="small">
            {t('get-started')}
          </Button>
        </Link>
        <Button variant="secondary" size="small" onClick={handleClickTrigger}>
          {t('contact-us')}
        </Button>
      </Buttons>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
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
