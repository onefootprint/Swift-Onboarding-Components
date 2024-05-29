import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import {
  Container,
  LinkButton,
  media,
  Stack,
  Tab,
  Tabs,
  Text,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

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
    <StyledContainer>
      <TitleContainer>
        <Text variant="display-2" color="primary" tag="h2">
          {t('title')}
        </Text>
        <Text variant="display-4" color="secondary" tag="h4">
          {t('subtitle')}
        </Text>
        <LinkButton
          iconComponent={IcoArrowRightSmall16}
          href="https://docs.onefootprint.com"
          target="_blank"
          variant="label-1"
        >
          {t('see-documentation')}
        </LinkButton>
      </TitleContainer>
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
      <ImageContainer justify="center" $imgSrc={imageSrc} />
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: ${theme.spacing[9]};
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    text-align: center;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding-top: ${theme.spacing[8]};

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[15]};
    `}
  `}
`;

const ImageContainer = styled(Stack)<{ $imgSrc: string }>`
  ${({ $imgSrc }) => css`
    position: relative;
    overflow: hidden;
    background-image: url(${$imgSrc});
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    aspect-ratio: 16/10;
    width: 100%;
  `}
`;

export default DeveloperExperience;
