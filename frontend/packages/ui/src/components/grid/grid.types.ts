import type { StackProps } from '../stack';

export type GridContainerProps = Omit<StackProps, 'columns' | 'rows'> & {
  columns?: string[];
  rows?: string[];
  templateAreas?: string[];
};

export type GridItemProps = StackProps & {
  column?: string;
  row?: string;
};
