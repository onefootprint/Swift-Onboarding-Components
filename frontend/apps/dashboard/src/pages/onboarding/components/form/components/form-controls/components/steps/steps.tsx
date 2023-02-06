import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeft24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import { LayoutGroup, motion } from 'framer-motion';
import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled-components';

export type StepsProps = {
  value: number;
  max: number;
  onPrev?: () => void;
};

const dotAnimationVariants = {
  active: {
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 0,
      bounce: 0,
    },
  },
  inactive: {
    y: 0,
  },
};

const Steps = ({ value, max, onPrev }: StepsProps) => {
  const { t } = useTranslation();
  const shouldPrev = value > 0;

  return (
    <Container>
      {shouldPrev && (
        <PrevContainer>
          <IconButton aria-label={t('back')} onClick={onPrev}>
            <IcoChevronLeft24 color="tertiary" />
          </IconButton>
        </PrevContainer>
      )}
      <LayoutGroup>
        <DotsContainer
          role="progressbar"
          aria-valuemax={max}
          aria-valuemin={0}
          aria-valuenow={value}
        >
          {times(max).map(index => (
            <Dot key={index} data-active={index === value} role="presentation">
              {index === value && (
                <ActiveMarker
                  layoutId="dot-active"
                  initial="inactive"
                  animate="active"
                  variants={dotAnimationVariants}
                />
              )}
            </Dot>
          ))}
        </DotsContainer>
      </LayoutGroup>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
`;

const PrevContainer = styled.div`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]};
    margin-left: calc(${theme.spacing[3]} * -1);
  `}
`;

const DotsContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
  `}
`;

const Dot = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    height: 8px;
    width: 8px;
    position: relative;
  `}
`;

const ActiveMarker = styled(motion.div)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    background: ${theme.backgroundColor.tertiary};
    height: 8px;
    width: 8px;
    position: absolute;
    top: 0;
    left: 0;
  `}
`;

export default Steps;
