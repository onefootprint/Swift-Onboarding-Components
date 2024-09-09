import getSectionMeta from 'src/utils/section';
import HeadingAnchor from './heading-anchor';

type H4Props = {
  children: string | string[];
};

const H4 = ({ children }: H4Props) => {
  const { id, label } = getSectionMeta(children);
  return (
    <HeadingAnchor id={id} variant="heading-4" tag="h4">
      {label}
    </HeadingAnchor>
  );
};

export default H4;
