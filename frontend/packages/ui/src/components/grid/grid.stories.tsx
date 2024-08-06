import type { Story } from '@storybook/react';

import Grid from './grid';
import type { GridContainerProps, GridItemProps } from './grid.types';

export default {
  component: Grid,
  title: 'Components/Grid',
  argTypes: {
    columns: {
      control: 'array',
      description: 'Array of number of columns & widths',
      name: 'Columns',
    },
    rows: {
      control: 'array',
      description: 'Array of number of rows & heights',
      name: 'Rows',
    },
    gap: {
      control: 'number',
      description: 'Gap between columns and rows',
      name: 'Gap',
    },
    columnGap: {
      control: 'number',
      description: 'Gap between columns only',
      name: 'Column Gap',
    },
    rowGap: {
      control: 'number',
      description: 'Gap between rows only',
      name: 'Row Gap',
    },
    gridAreas: {
      control: 'array',
      description: 'Array of grid areas',
      name: 'Grid Areas',
    },
  },
};

const Template: Story<GridContainerProps & GridItemProps> = ({
  columns,
  rowGap,
  columnGap,
  templateAreas,
  rows,
  gap,
}: GridContainerProps & GridItemProps) => (
  <Grid.Container
    columns={columns}
    rows={rows}
    gap={gap}
    rowGap={rowGap}
    columnGap={columnGap}
    templateAreas={templateAreas}
  >
    {items.map(item => (
      <Grid.Item
        key={item.id}
        backgroundColor="secondary"
        align="center"
        justify="center"
        padding={2}
        borderColor="primary"
        borderPosition="all"
        borderWidth={1}
        borderRadius="default"
        fontStyle="body-4"
        gridArea={item.gridArea}
      >
        {item.content}
      </Grid.Item>
    ))}
  </Grid.Container>
);

export const Container = Template.bind({});
Container.args = {
  // @ts-ignore
  columns: ['1fr', '1fr', '200px'],
  rows: ['1fr', '100px', '1fr'],
  gap: 2,
  templateAreas: ['header header header', 'sidebar content content', 'footer footer footer'],
};

const items = [
  {
    id: '1',
    content: 'Header 1',
    gridArea: 'header',
  },
  {
    id: '2',
    content: 'Header 2',
    gridArea: 'header',
  },
  {
    id: '3',
    content: 'Header 3',
    gridArea: 'header',
  },
  {
    id: '4',
    content: 'Sidebar 4',
    gridArea: 'sidebar',
  },
  {
    id: '5',
    content: 'Content 5',
    gridArea: 'content',
  },
  {
    id: '6',
    content: 'Footer 6',
    gridArea: 'footer',
  },
];
