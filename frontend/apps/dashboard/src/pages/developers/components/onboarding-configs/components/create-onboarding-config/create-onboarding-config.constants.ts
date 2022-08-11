import { DataKinds } from 'src/types/data-kind';

const DEFAULT_FORM_VALUES = {
  all: true,
  name: true,
  [DataKinds.city]: true,
  [DataKinds.country]: true,
  [DataKinds.dob]: true,
  [DataKinds.email]: true,
  [DataKinds.lastFourSsn]: true,
  [DataKinds.phoneNumber]: true,
  [DataKinds.ssn]: true,
  [DataKinds.state]: true,
  [DataKinds.streetAddress]: true,
  [DataKinds.streetAddress2]: true,
  [DataKinds.zip]: true,
};

export default DEFAULT_FORM_VALUES;
