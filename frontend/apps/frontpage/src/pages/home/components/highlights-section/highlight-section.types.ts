import type { StaticImageData } from 'next/image';

export type Highlight = {
  content: string;
  imgAlt: string;
  imgSrc: StaticImageData;
  title: string;
};
