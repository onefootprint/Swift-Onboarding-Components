import type { Attribute } from '../data/entity';

export type GetHistoricalEntityDataRequest = {
  id: string;
  seqno: string | undefined;
};

export type GetHistoricalEntityDataResponse = Attribute[];
