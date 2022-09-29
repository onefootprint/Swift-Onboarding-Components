import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import Image from 'next/image';
import React from 'react';
import { useSwipeable } from 'react-swipeable';
import styled, { css } from 'styled-components';
import { Button, media, Tooltip } from 'ui';

import Pager from './components/pager';
import useCarouselIndex from './hooks/use-carousel-index';
import useCarouselStyle from './hooks/use-carousel-style';

const Carousel = () => {
  const { t } = useTranslation('pages.compare.carousel');
  const slides = [
    {
      src: '/compare/carousel/carousel-1.png',
      alt: t('slide.integration.alt'),
      tooltip: t('slide.integration.tooltip'),
    },
    {
      src: '/compare/carousel/carousel-2.png',
      alt: t('slide.one-click.alt'),
      tooltip: t('slide.one-click.tooltip'),
    },
    {
      src: '/compare/carousel/carousel-3.png',
      alt: t('slide.dashboard-overview.alt'),
      tooltip: t('slide.dashboard-overview.tooltip'),
    },
    {
      src: '/compare/carousel/carousel-4.png',
      alt: t('slide.dashboard-user.alt'),
      tooltip: t('slide.dashboard-user.tooltip'),
    },
    {
      src: '/compare/carousel/carousel-5.png',
      alt: t('slide.my-footprint.alt'),
      tooltip: t('slide.my-footprint.tooltip'),
    },
  ];
  const carousel = useCarouselIndex(slides.length);
  const carouselStyle = useCarouselStyle(slides.length, carousel.index);
  const swipeHandler = useSwipeable({
    onSwipedLeft: carousel.goForward,
    onSwipedRight: carousel.goBack,
  });

  return (
    <Container>
      <ControlContainer>
        <Tooltip text={slides[carousel.previousIndex].tooltip} placement="top">
          <Button aria-label={t('back')} onClick={carousel.goBack}>
            <IcoChevronLeftBig24 color="quinary" />
          </Button>
        </Tooltip>
      </ControlContainer>
      <Slider index={carousel.index}>
        {slides.map((slide, slideIndex) => (
          <Slide
            ref={slideIndex === carousel.index ? swipeHandler.ref : undefined}
            aria-label={t('slide.button-label', { index: slideIndex + 1 })}
            key={slide.src}
            style={
              {
                '--index-from-selected': carouselStyle[slideIndex].selected,
                '--scale': carouselStyle[slideIndex].scale,
                '--z-index': carouselStyle[slideIndex].zIndex,
              } as React.CSSProperties
            }
          >
            <Image
              alt={slide.alt}
              height={593}
              priority
              src={slide.src}
              width={950}
            />
          </Slide>
        ))}
      </Slider>
      <PagerContainer>
        <Pager
          max={slides.length}
          onClick={carousel.goToIndex}
          value={carousel.index}
        />
      </PagerContainer>
      <ControlContainer>
        <Tooltip text={slides[carousel.nextIndex].tooltip} placement="top">
          <Button aria-label={t('next')} onClick={carousel.goForward}>
            <IcoChevronLeftBig24 color="quinary" />
          </Button>
        </Tooltip>
      </ControlContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin: 0 ${theme.spacing[5]}px;
    position: relative;

    ${media.greaterThan('md')`
      margin: 0 auto;
      max-width: 900px;
    `}
  `}
`;

const ControlContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 275px;
    z-index: 15;
    display: none;

    ${media.greaterThan('md')`
    display: block;
  `}

    &:first-child {
      left: -54px;
    }

    &:last-child {
      right: -56px;

      button {
        transform: rotate(180deg);
      }
    }

    button {
      border-radius: 50%;
      box-shadow: ${theme.elevation[3]};
      height: 48px;
      padding: 0;
      width: 48px;
    }
  `}
`;

const Slider = styled.div<{ index: number }>`
  position: relative;
`;

const Slide = styled.div`
  position: relative;
  width: 100%;
  transform: translateX(calc(-6vw * var(--index-from-selected)))
    scale(var(--scale));
  transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1),
    filter 0.8s cubic-bezier(0.19, 1, 0.22, 1);
  z-index: var(--z-index);
  will-change: transform, opacity;
  user-select: none;

  &:not(:first-child) {
    position: absolute;
    left: 0;
    top: 0;
  }
`;

const PagerContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    margin-top: ${theme.spacing[4]}px;
  `}
`;

export default Carousel;
