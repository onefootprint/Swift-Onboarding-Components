import { motion, useAnimationControls, useInView } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Tag from './components/tag';
import { tagKeys } from './constants';

const IllustrationConfidence = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 'all' });
  const controlsTags = useAnimationControls();
  const controlsLights = useAnimationControls();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.kyc.confidence.tags',
  });

  useEffect(() => {
    if (isInView) {
      controlsTags.start(i => ({
        opacity: [0, 1],
        y: [0, -2, 0],
        transition: {
          delay: i * 0.2,
          duration: 0.5,
          ease: 'easeInOut',
        },
      }));
      controlsLights.start({
        opacity: [0, 0.2, 0.1],
        scaleY: [1, 1.3, 1],
        transition: {
          duration: 2,
          ease: 'easeInOut',
        },
      });
    }
  }, [controlsLights, controlsTags, isInView]);

  return (
    <Container ref={ref}>
      <Squares src="/kyc/sticky-rail/squares.svg" height={700} width={1500} alt="" />
      <TagList>
        {tagKeys.map(({ key, icon: Icon, order }) => (
          <motion.span custom={order} animate={controlsTags} initial={{ opacity: 0 }} key={key}>
            <Tag key={key} icon={Icon}>
              {t(key as ParseKeys<'common'>)}
            </Tag>
          </motion.span>
        ))}
      </TagList>
      <Background animate={controlsLights} initial={{ opacity: 0 }} />
    </Container>
  );
};

const Container = styled(motion.div)`
  max-width: 100%;
  height: 480px;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  mask: radial-gradient(circle, black 0%, black 50%, transparent 80%);
  mask-mode: alpha;
  isolation: isolate;
  user-select: none;
  pointer-events: none;
`;

const Squares = styled(Image)`
  width: 200%;
  height: 100%;
`;

const TagList = styled.ul`
  ${({ theme }) => css`
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
  `};
`;

const Background = styled(motion.span)`
  ${({ theme }) => css`
    z-index: -1;
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      50% 50% at 50% 50%,
      ${theme.backgroundColor.quinary} 0%,
      ${theme.backgroundColor.transparent} 100%
    );
  `};
`;

export default IllustrationConfidence;
