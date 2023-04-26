import UserDataAttribute from './user-data-attribute';

export type BootstrapData = {
  [UserDataAttribute.email]: string;
  [UserDataAttribute.phoneNumber]: string;
};
