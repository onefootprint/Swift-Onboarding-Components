import getSectionMeta from 'src/utils/section';
import HeadingAnchor from './heading-anchor';

type H2Props = {
  children: string | string[];
};

const H2 = ({ children }: H2Props) => {
  const { id, label } = getSectionMeta(children);
  return (
    <HeadingAnchor id={id} variant="heading-2" tag="h2">
      {label}
    </HeadingAnchor>
  );
};

export default H2;
