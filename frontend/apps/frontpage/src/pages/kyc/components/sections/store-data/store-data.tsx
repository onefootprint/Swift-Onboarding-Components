import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import {
  Container,
  LinkButton,
  media,
  Stack,
  Tabs,
  Text,
} from '@onefootprint/ui';
import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const StoreData = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.kyc.storage' });
  const options = [
    {
      label: t('sections.users'),
      value: 'users',
    },
    {
      label: t('sections.user-details'),
      value: 'user-details',
    },
    {
      label: t('sections.settings'),
      value: 'settings',
    },
  ];

  const [segment, setSegment] = useState(options[0].value);
  const [imageSrc, setImageSrc] = useState(`/kyc/store-data/${segment}.png`);

  const handleChange = (value: string) => {
    setSegment(value);
    setImageSrc(`/kyc/store-data/${value}.png`);
  };

  return (
    <SectionContainer>
      <TitleContainer>
        <Text variant="display-2" color="primary" tag="h2">
          {t('title')}
        </Text>
        <Text variant="display-4" color="secondary">
          {t('subtitle')}
        </Text>
        <LinkButton
          iconComponent={IcoArrowRightSmall16}
          href="/vaulting"
          target="_blank"
        >
          {t('learn-more')}
        </LinkButton>
      </TitleContainer>
      <Tabs options={options} onChange={handleChange} />
      <ImageContainer>
        <Image
          src={imageSrc}
          alt={segment}
          height={838}
          width={1280}
          priority
        />
      </ImageContainer>
    </SectionContainer>
  );
};

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    text-align: center;
    flex-direction: column;
    gap: ${theme.spacing[4]};

    p {
      max-width: 600px;
    }
  `}
`;

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    margin-top: ${theme.spacing[13]};

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[15]};
    `}
  `}
`;

const ImageContainer = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 360px;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    img {
      position: absolute;
      top: ${theme.spacing[5]};
      left: ${theme.spacing[5]};
      transform: scale(0.5);
      transform-origin: top left;
    }

    ${media.greaterThan('md')`
      height: auto;
      background-color: transparent;  
      border: none;

      img {
        position: relative;
        transform: scale(1);
        width: 100%;  
        top: 0;
        left: 0;  
      }
    `}
  `}
`;
export default StoreData;
