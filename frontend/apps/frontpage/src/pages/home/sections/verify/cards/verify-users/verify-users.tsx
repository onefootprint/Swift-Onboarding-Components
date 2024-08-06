import { IcoIdCard16, IcoUser16 } from '@onefootprint/icons';
import { Stack, media } from '@onefootprint/ui';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import BaseCard from '../../components/base-card';
import CardTitle from '../../components/card-title';
import CustomToggle from './components/custom-toggle';
import Field from './components/field';
import UserPhoto from './components/user-photo';

const sections = [
  { value: 'user-input-data', labelKey: 'user-input-data', icon: IcoUser16 },
  { value: 'ocr-data', labelKey: 'ocr-data', icon: IcoIdCard16 },
];

const VerifyUsers = () => {
  const [activeSection, setActiveSection] = useState('user-input-data');
  const controls = useAnimation();

  const handleToggleChange = (value: string) => {
    setActiveSection(value);
  };
  useEffect(() => {
    controls
      .start({
        opacity: 1,
        filter: 'blur(2px)',
        transition: { duration: 0.15 },
      })
      .then(() => {
        controls.start({
          filter: 'blur(0px)',
          transition: { duration: 0.15 },
        });
      });
  }, [activeSection, controls]);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.verify',
  });

  const getSrc = () => {
    if (activeSection === 'user-input-data') {
      return '/home/verify-cards/good-penguin.png';
    }
    return '/home/verify-cards/bad-penguin.png';
  };

  const inputData = () => {
    if (activeSection === 'user-input-data') {
      return {
        firstString: '2234',
        diff: 'Any',
        secondString: 'where Street, Albany, 12222',
      };
    }
    return {
      firstString: '2234',
      diff: 'Some',
      secondString: 'where Street, Albany, 12222',
    };
  };

  return (
    <BaseCard overflow="hidden" backgroundImage="/home/verify-cards/paper.png">
      <CardTitle title={t('title')} subtitle={t('subtitle')} />
      <Stack direction="column" align="center">
        <CustomToggle sections={sections} onChange={handleToggleChange} activeSection={activeSection} />
        <Container>
          <FieldsContainer>
            <Field label="Name" firstString="Percy Littlefeet" />
            <motion.div initial={{ opacity: 0, filter: 'blur(5px)' }} animate={controls}>
              <Field
                label="Address"
                firstString={inputData().firstString}
                diff={inputData().diff}
                secondString={inputData().secondString}
              />
            </motion.div>
          </FieldsContainer>
          <PositionedUserPhoto src={getSrc()} rotate={activeSection === 'user-input-data' ? 10 : -5} />
        </Container>
      </Stack>
    </BaseCard>
  );
};

const PositionedUserPhoto = styled(UserPhoto)<{ rotate: number }>`
  ${({ rotate }) => css`
    transform: rotate(${rotate}deg);
    transition: transform 0.3s ease-in-out;
  `}
`;

const Container = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[9]};
    gap: ${theme.spacing[7]};

    ${media.greaterThan('md')`
      flex-direction: row;
    `}
  `}
`;

const FieldsContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    position: relative;
    gap: ${theme.spacing[7]};
    z-index: 2;
    justify-content: center;
    width: 100%;
  `}
`;

export default VerifyUsers;
