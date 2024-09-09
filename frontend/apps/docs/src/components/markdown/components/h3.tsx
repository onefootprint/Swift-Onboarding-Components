import getSectionMeta from 'src/utils/section';
import HeadingAnchor from './heading-anchor';

type H3Props = {
  children: string | string[];
};

const H3 = ({ children }: H3Props) => {
  const { id, label } = getSectionMeta(children);
  return (
    <HeadingAnchor id={id} variant="heading-3" tag="h3">
      {label}
    </HeadingAnchor>
  );
};

export default H3;
