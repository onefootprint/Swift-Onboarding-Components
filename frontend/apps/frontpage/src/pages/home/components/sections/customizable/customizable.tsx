import {
  IcoCode216,
  IcoFileText16,
  IcoHeart16,
  IcoLayer0116,
} from '@onefootprint/icons';
import { Container, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SectionVerticalSpacer from 'src/components/section-vertical-spacer';
import styled, { css } from 'styled-components';

import SectionTitle from '../../section-title/section-title';
import Card from './components/card';
import CustomizableIllustration from './components/illustrations/customizable-illustration';
import EasyFlexibleIllustration from './components/illustrations/easy-flexible-illustration';
import FineTuneIllustration from './components/illustrations/fine-tune-illustration';
import WorldClassIllustration from './components/illustrations/world-class-illustration';

type HoverableIllustrationProps = {
  isHover: boolean;
};

const HoverableCustomizableIllustration = ({
  isHover,
}: HoverableIllustrationProps) => (
  <CustomizableIllustration isHover={isHover} />
);

const HoverableEasyFlexibleIllustration = ({
  isHover,
}: HoverableIllustrationProps) => (
  <EasyFlexibleIllustration isHover={isHover} />
);

const HoverableFineTuneIllustration = ({
  isHover,
}: HoverableIllustrationProps) => <FineTuneIllustration isHover={isHover} />;

const HoverableWorldClassIllustration = ({
  isHover,
}: HoverableIllustrationProps) => <WorldClassIllustration isHover={isHover} />;

const Customizable = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.customizable',
  });

  return (
    <>
      <SectionVerticalSpacer />
      <SectionTitle
        title={t('title')}
        subtitle={t('subtitle')}
        cta={t('cta')}
        iconSrc="/home/customizable/ico-illustrated-customisation-40.svg"
        href="https://docs.onefootprint.com"
      />
      <Grid>
        <Card
          title={t('your-own.title')}
          subtitle={t('your-own.subtitle')}
          iconComponent={IcoHeart16}
          illustration={HoverableCustomizableIllustration}
        />
        <Card
          title={t('easy-flexible.title')}
          subtitle={t('easy-flexible.subtitle')}
          iconComponent={IcoLayer0116}
          illustration={HoverableEasyFlexibleIllustration}
        />
        <Card
          title={t('fine-tune.title')}
          subtitle={t('fine-tune.subtitle')}
          iconComponent={IcoCode216}
          illustration={HoverableFineTuneIllustration}
        />
        <Card
          title={t('world-class.title')}
          subtitle={t('world-class.subtitle')}
          iconComponent={IcoFileText16}
          illustration={HoverableWorldClassIllustration}
        />
      </Grid>
      <SectionVerticalSpacer />
    </>
  );
};

const Grid = styled(Container)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.spacing[8]};
    margin-top: ${theme.spacing[9]};

    ${media.greaterThan('sm')`
      grid-template-columns: 1fr 1fr;
      grid-template-rows: fit-content(100%);
    `}
  `}
`;

export default Customizable;
