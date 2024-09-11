import { Text } from '@onefootprint/ui';
import styled from 'styled-components';
import type { Option } from '../../collected-information.types';
import useInfoLabel from '../../hooks/use-info-label';

type LabelProps = {
  name: keyof Option;
  value: Option[keyof Option];
};

const Label = ({ name, value }: LabelProps) => {
  const getLabel = useInfoLabel();

  return (
    <StyledLabel variant="body-2" color="secondary">
      {getLabel(name, value)}
    </StyledLabel>
  );
};

const StyledLabel = styled(Text)`
  white-space: nowrap;
  text-align: right;
`;

export default Label;
