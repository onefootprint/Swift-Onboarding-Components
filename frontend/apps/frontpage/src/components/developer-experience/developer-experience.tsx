import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Container,
  LinkButton,
  media,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@onefootprint/ui';
import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const DeveloperExperience = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.developer-experience',
  });
  const options = [
    {
      label: t('tabs.configuration'),
      value: 'configuration',
    },
    {
      label: t('tabs.customization'),
      value: 'customization',
    },
    {
      label: t('tabs.documentation'),
      value: 'documentation',
    },
  ];

  const [segment, setSegment] = useState(options[0].value);
  const [imageSrc, setImageSrc] = useState(
    `/developer-experience/${segment}.png`,
  );

  const handleChange = (value: string) => {
    setSegment(value);
    setImageSrc(`/developer-experience/${value}.png`);
  };

  return (
    <Container>
      <Stack align="center" justify="center" direction="column" gap={9}>
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
        <Stack
          align="center"
          justify="center"
          direction="column"
          gap={5}
          width="100%"
        >
          <Scrubber>
            <Tabs>
              {options.map(({ value, label }) => (
                <Tab
                  as="button"
                  key={value}
                  onClick={() => handleChange(value)}
                  selected={segment === value}
                >
                  {label}
                </Tab>
              ))}
            </Tabs>
          </Scrubber>
          <ImageContainer justify="center">
            <Image
              src={imageSrc}
              alt={segment}
              height={838}
              width={1280}
              priority
            />
          </ImageContainer>
        </Stack>
      </Stack>
    </Container>
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

export default DeveloperExperience;
