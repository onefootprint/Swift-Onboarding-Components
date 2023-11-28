import { Dialog, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled, { css } from 'styled-components/native';

import useTranslation from '@/hooks/use-translation';

const Banner = () => {
  const { t } = useTranslation('screens.preview');
  const [open, setOpen] = useState(true);
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar height={insets.top} />
      <Container top={insets.top}>
        <Typography variant="body-3" color="info">
          {t('banner')}
        </Typography>
      </Container>
      <Dialog
        onClose={() => setOpen(false)}
        open={open}
        title={t('about.title')}
        cta={{
          label: t('about.cta'),
          onPress: () => setOpen(false),
        }}
      >
        <Typography variant="body-3" center>
          {t('about.content')}
        </Typography>
      </Dialog>
    </>
  );
};

const StatusBar = styled.View<{ height: number }>`
  ${({ theme, height }) => css`
    background: ${theme.backgroundColor.info};
    height: ${height}px;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
  `}
`;

const Container = styled.View<{ top: number }>`
  ${({ theme, top }) => css`
    align-items: center;
    background: ${theme.backgroundColor.info};
    height: 48px;
    justify-content: center;
    left: 0;
    position: absolute;
    top: ${top}px;
    width: 100%;
    z-index: 1;
  `}
`;

export default Banner;
