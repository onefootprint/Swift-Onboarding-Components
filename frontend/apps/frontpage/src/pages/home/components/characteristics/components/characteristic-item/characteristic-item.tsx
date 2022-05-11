import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Typography } from 'ui';

import type { Characteristic } from '../../characteristics.types';

type CharacteristicItemProps = Characteristic;

const Characteristics = ({
  titleText,
  imageAltText,
  imagePath,
  descriptionText,
}: CharacteristicItemProps) => (
  <Container>
    <ImageContainer>
      <Image
        alt={imageAltText}
        height={200}
        layout="responsive"
        src={imagePath}
        width={365}
      />
    </ImageContainer>
    <Content>
      <Typography
        color="primary"
        variant="heading-2"
        as="h5"
        sx={{ marginBottom: 5 }}
      >
        {titleText}
      </Typography>
      <Typography color="secondary" variant="body-2" as="p">
        {descriptionText}
      </Typography>
    </Content>
  </Container>
);

const Container = styled.article`
  ${({ theme }) => css`
    backdrop-filter: blur(60px);
    background: rgba(255, 255, 255, 0.6);
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
  `}
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]}px;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]}px;
  `}
`;

export default Characteristics;
