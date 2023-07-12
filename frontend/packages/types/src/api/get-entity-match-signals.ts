import { MatchLevel, MatchSignal } from '../data';

export type GetEntityMatchSignalsRequest = {
  id: string;
};

type GetEntityMatchSignalsResponseValues = {
  matchLevel: MatchLevel;
  signals: MatchSignal[];
} | null;

export type GetEntityMatchSignalsResponse = {
  address: GetEntityMatchSignalsResponseValues;
  dob: GetEntityMatchSignalsResponseValues;
  email: GetEntityMatchSignalsResponseValues;
  name: GetEntityMatchSignalsResponseValues;
  phone: GetEntityMatchSignalsResponseValues;
  ssn: GetEntityMatchSignalsResponseValues;
  document: GetEntityMatchSignalsResponseValues;
};
