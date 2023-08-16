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
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import settingsImage from './images/settings.png';
import userDetailsImage from './images/user-details.png';
import usersImage from './images/users.png';

const StoreData = () => {
  const { t } = useTranslation('pages.kyc.storage');
  const options = [
    {
      label: t('sections.users'),
      value: 'users',
      image: usersImage,
      icon: IcoUsers16,
    },
    {
      label: t('sections.user-details'),
      value: 'user-details',
      image: userDetailsImage,
      icon: IcoUser16,
    },
    {
      label: t('sections.settings'),
      value: 'settings',
      image: settingsImage,
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
    setImage(foundOption ? foundOption.image : options[0].image);
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
          href="/vaulting"
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
      <ImageContainer>
        <Image
          src={image}
          alt={segment}
          height={838}
          width={1280}
          priority
          placeholder="blur"
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

const ImageContainer = styled.div`
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
