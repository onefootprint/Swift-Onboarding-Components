import { useTranslation } from '@onefootprint/hooks';
import {
  IcoArrowRightSmall16,
  IcoSettings16,
  IcoUser16,
  IcoUsers16,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Container,
  LinkButton,
  media,
  Tab,
  Tabs,
  Typography,
} from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const StoreData = () => {
  const { t } = useTranslation('pages.kyc.storage');
  const options = [
    {
      label: t('sections.users'),
      value: 'users',
      image: '/kyc/storage/user-details.png',
      icon: IcoUsers16,
    },
    {
      label: t('sections.user-details'),
      value: 'user-details',
      image: '/kyc/storage/users.png',
      icon: IcoUser16,
    },
    {
      label: t('sections.settings'),
      value: 'settings',
      image: '/kyc/storage/settings.png',
      icon: IcoSettings16,
    },
  ];

  const [segment, setSegment] = useState(options[0].value);
  const [image, setImage] = useState(options[0].image);

  const handleChange = (value: string) => {
    setSegment(value);
  };

  useEffect(() => {
    const foundOption = options.find(option => option.value === segment);
    setImage(foundOption ? foundOption.image : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  return (
    <SectionContainer>
      <TitleContainer>
        <Typography variant="display-2" color="primary" as="h2">
          {t('title')}
        </Typography>
        <Typography variant="display-4" color="secondary" as="p">
          {t('subtitle')}
        </Typography>
        <LinkButton
          iconComponent={IcoArrowRightSmall16}
          href="https://docs.onefootprint.com"
          target="_blank"
        >
          {t('learn-more')}
        </LinkButton>
      </TitleContainer>
      <Tabs variant="pill">
        {options.map(({ value, label, icon }) => (
          <Tab
            as="button"
            key={value}
            onClick={() => handleChange(value)}
            selected={segment === value}
            icon={icon}
          >
            {label}
          </Tab>
        ))}
      </Tabs>
      <ImageContainer
        key={segment}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
        }}
      >
        <Image src={image} alt={segment} height={838} width={1280} />
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

const ImageContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export default StoreData;
