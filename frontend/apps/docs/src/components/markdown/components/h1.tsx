import getSectionMeta from 'src/utils/section';
import HeadingAnchor from './heading-anchor';

type H1Props = {
  children: string | string[];
};

const H1 = ({ children }: H1Props) => {
  const { id, label } = getSectionMeta(children);
  return (
    <HeadingAnchor id={id} variant="heading-1" tag="h1">
      {label}
    </HeadingAnchor>
  );
};

export default H1;
