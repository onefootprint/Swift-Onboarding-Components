import Text from '../../../../../text';
import type { StepperStatus } from '../../../../stepper.types';

type LabelProps = {
  children: string;
  status: StepperStatus;
};

const Label: React.FC<LabelProps> = ({ status, children }) => {
  const isAccent = status === 'selected' || status === 'completed';
  const variant = isAccent ? 'label-3' : 'body-3';
  const color = isAccent ? 'accent' : 'primary';

  return (
    <Text variant={variant} color={color}>
      {children}
    </Text>
  );
};

export default Label;
