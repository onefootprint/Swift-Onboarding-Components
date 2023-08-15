import { useTranslation } from '@onefootprint/hooks';
import {
  IcoArrowRightSmall16,
  IcoFileText16,
  IcoPencil16,
  IcoSettings16,
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

const DeveloperExperience = () => {
  const { t } = useTranslation('pages.kyb.developer-experience');
  const options = [
    {
      label: t('sections.configuration'),
      value: 'configuration-kyb',
      image: '/kyb/developer-experience/configuration.png',
      icon: IcoSettings16,
    },
    {
      label: t('sections.customization'),
      value: 'customization-kyb',
      image: '/kyb/developer-experience/customization.png',
      icon: IcoPencil16,
    },
    {
      label: t('sections.documentation'),
      value: 'documentation-kyb',
      image: '/kyb/developer-experience/documentation.png',
      icon: IcoFileText16,
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
          {t('see-documentation')}
        </LinkButton>
      </TitleContainer>
      <Scrubber>
        <Pop layout>
          <Tabs variant="underlined">
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
        </Pop>
      </Scrubber>
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
        <Image src={image} alt={segment} height={838} width={1280} priority />
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
    padding-top: ${theme.spacing[8]};

    p {
      max-width: 600px;
    }

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[15]};
    `}
  `}
`;

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: ${theme.spacing[9]};
  `}
`;

const Scrubber = styled.div`
  position: relative;
  overflow: auto;
  width: 100vw;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  -ms-overflow-style: none; /* for Internet Explorer, Edge */
  scrollbar-width: none; /* for Firefox */
  overflow-x: scroll;

  &::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
  }
`;

const Pop = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    padding: 0 ${theme.spacing[5]};
    position: absolute;
    left: 0;

    ${media.greaterThan('md')`
      position: relative;
      left: auto;
    `}
  `}
`;

const ImageContainer = styled(motion.div)`
  max-width: 100%;
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

export default DeveloperExperience;
