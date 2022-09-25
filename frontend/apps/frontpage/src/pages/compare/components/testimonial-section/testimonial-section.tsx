import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import Testimonial from 'src/components/testimonial';

const TestimonialSection = () => {
  const { t } = useTranslation('pages.compare.testimonial');
  const testimonialAuthor = {
    imgSrc: '/testimonial/shardul-shah.png',
    name: t('author.name'),
    role: t('author.role'),
    imgAlt: t('author.img-alt'),
  };

  return <Testimonial quote={t('quote')} author={testimonialAuthor} />;
};

export default TestimonialSection;
