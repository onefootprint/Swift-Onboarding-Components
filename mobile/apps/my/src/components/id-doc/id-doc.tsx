import React from 'react';

// import DriversLicense from './screens/drivers-license';
// import Passport from './screens/passport';
import Selfie from './screens/selfie';

export type IdDocProps = {
  authToken: string;
  onDone: () => void;
};

const IdDoc = ({ authToken, onDone }: IdDocProps) => {
  console.log(authToken);
  console.log(onDone);
  return <Selfie onSubmit={() => {}} />;
};

export default IdDoc;
