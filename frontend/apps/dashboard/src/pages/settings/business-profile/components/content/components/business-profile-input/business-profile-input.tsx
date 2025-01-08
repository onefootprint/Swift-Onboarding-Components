import { Form } from '@onefootprint/ui';
import React from 'react';

const BusinessProfileInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<typeof Form.Input>>(
  (props, ref) => {
    return (
      <div className="min-w-[350px]">
        <Form.Input className="max-w-[300px] w-full" size="compact" {...props} ref={ref} />
      </div>
    );
  },
);

export default BusinessProfileInput;
