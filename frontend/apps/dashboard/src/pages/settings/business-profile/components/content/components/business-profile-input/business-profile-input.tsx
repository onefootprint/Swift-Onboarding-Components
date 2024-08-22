import { Form } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

const BusinessProfileInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<typeof Form.Input>>(
  (props, ref) => {
    return (
      <OuterContainer>
        <InnerContainer {...props} ref={ref} />
      </OuterContainer>
    );
  },
);

const InnerContainer = styled(Form.Input)`
  width: 300px;
`;

const OuterContainer = styled.div`
  min-width: 350px;
`;

export default BusinessProfileInput;
