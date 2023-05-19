import React, { useState } from 'react';

import CardInput from './card-number-input';

type InteractiveCardInputProps = {
  invalidMessage?: string;
};

const InteractiveCardInput = ({
  invalidMessage,
}: InteractiveCardInputProps) => {
  const [value, setValue] = useState('');
  return (
    <>
      <CardInput
        invalidMessage={invalidMessage}
        onChangeText={setValue}
        value={value}
      />
      <button type="submit">Submit</button>
    </>
  );
};

export default InteractiveCardInput;
