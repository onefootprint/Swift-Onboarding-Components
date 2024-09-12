import Text from '../../../../../text';
import type { StepperStatus } from '../../../../stepper.types';

type SubLabelProps = {
  status: StepperStatus;
  children: React.ReactNode;
};

const SubLabel: React.FC<SubLabelProps> = ({ status, children }) => {
  const isAccent = status === 'selected' || status === 'completed';
  const variant = isAccent ? 'label-3' : 'body-3';
  const color = isAccent ? 'accent' : 'secondary';

  return (
    <Text variant={variant} color={color} paddingLeft={3}>
      {children}
    </Text>
  );
};

export default SubLabel;
