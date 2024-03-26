import React, { useEffect } from 'react';

import s from '../onboarding-components.module.css';

const Otp = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    onDone();
  }, []);

  return (
    <div className={s.container}>
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>OTP</legend>
      </fieldset>
    </div>
  );
};

export default Otp;
