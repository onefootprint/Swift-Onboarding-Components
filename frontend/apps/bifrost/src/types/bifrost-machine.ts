export enum States {
  emailIdentification = 'emailIdentification',
  basicInformation = 'basicInformation',
  phoneVerification = 'phoneVerification',
  verificationSuccess = 'verificationSuccess',
  phoneRegistration = 'phoneRegistration',
  residentialAddress = 'residentialAddress',
  ssn = 'ssn',
  registrationSuccess = 'registrationSuccess',
}

export enum Events {
  userFound = 'userFound',
  userNotFound = 'userNotFound',
  changeEmail = 'changeEmail',
  phoneSubmitted = 'phoneSubmitted',
  userCreated = 'userCreated',
  userInherited = 'userInherited',
  basicInformationSubmitted = 'basicInformationSubmitted',
  residentialAddressSubmitted = 'residentialAddressSubmitted',
  ssnSubmitted = 'ssnSubmitted',
  registrationCompleted = 'registrationCompleted',
}
