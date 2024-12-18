import type { Option } from '../../collected-information.types';
import useInfoLabel from '../../hooks/use-info-label';

type LabelProps = {
  name: keyof Option;
  value: Option[keyof Option];
};

const Label = ({ name, value }: LabelProps) => {
  const getLabel = useInfoLabel();

  return <p className="text-body-2 text-secondary whitespace-nowrap">{getLabel(name, value)}</p>;
};

export default Label;
