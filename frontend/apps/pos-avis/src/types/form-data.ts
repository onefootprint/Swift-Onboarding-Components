export type FormData = Partial<{
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;

  // Address data
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;

  // custom data
  category: string;
  awd: string;
  reservedCarClass: string;
  elor: string;
  rentalZone: string;
  under24hRental: string;
  businessLeisure: string;
  localMarketIndicator: string;
  distributionChannel: string;
}>;
