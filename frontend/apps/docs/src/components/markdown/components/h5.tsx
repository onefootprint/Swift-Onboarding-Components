import getSectionMeta from 'src/utils/section';
import HeadingAnchor from './heading-anchor';

type H5Props = {
  children: string | string[];
};

const H5 = ({ children }: H5Props) => {
  const { id, label } = getSectionMeta(children);
  return (
    <HeadingAnchor id={id} variant="heading-5" tag="h5">
      {label}
    </HeadingAnchor>
  );
};

export default H5;
