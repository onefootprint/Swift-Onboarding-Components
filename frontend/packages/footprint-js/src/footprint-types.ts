export enum FootprintEvents {
  closed = 'closed',
  completed = 'completed',
  canceled = 'canceled',
}

export type ShowFootprint = {
  publicKey?: string;
  onCompleted?: (validationToken: string) => void;
  onCanceled?: () => void;
};

export type Footprint = {
  show: ({
    publicKey,
    onCompleted,
    onCanceled,
  }: ShowFootprint) => Promise<void>;
};
