export type Period = Periods.monthly | Periods.yearly;

export type HeaderProps = {
  title: string;
  price?: {
    monthly?: number;
    yearly?: number;
  };
};

export enum Periods {
  monthly = 'monthly',
  yearly = 'yearly',
}

export enum Plans {
  startup = 'startup',
  growth = 'growth',
  enterprise = 'enterprise',
}
