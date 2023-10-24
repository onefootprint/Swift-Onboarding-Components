import type { Story } from '@storybook/react';
import React from 'react';

import type { ContainerProps, ItemProps } from './grid';
import Grid from './grid';

export default {
  component: Grid,
  title: 'Components/Grid',
  argTypes: {
    columns: {
      control: 'array',
      description: 'Array of column widths',
      name: 'Columns',
    },
    rows: {
      control: 'array',
      description: 'Array of row heights',
      name: 'Rows',
    },
    gap: {
      control: 'number',
      description: 'Gap between columns',
      name: 'Gap',
    },
    columnGap: {
      control: 'number',
      description: 'Gap between columns',
      name: 'Column Gap',
    },
    rowGap: {
      control: 'number',
      description: 'Gap between rows',
      name: 'Row Gap',
    },
    gridAreas: {
      control: 'array',
      description: 'Array of grid areas',
      name: 'Grid Areas',
    },
  },
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

const Template: Story<ContainerProps & ItemProps> = ({
  columns,
  rowGap,
  columnGap,
  templateAreas,
  rows,
  gap,
}: ContainerProps & ItemProps) => (
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

export const Base = Template.bind({});
Base.args = {
  columns: ['1fr', '1fr', '200px'],
  rows: ['1fr', '100px', '1fr'],
  gap: 2,
  templateAreas: [
    'header header header',
    'sidebar content content',
    'footer footer footer',
  ],
};
