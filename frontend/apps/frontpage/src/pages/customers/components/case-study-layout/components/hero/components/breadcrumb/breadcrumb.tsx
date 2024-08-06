import { Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import styled from 'styled-components';

type BreadcrumbItem = {
  label: string;
  href: string;
};

type ItemsProps = {
  items: BreadcrumbItem[];
  activeRoute: string;
};

const Breadcrumb = ({ items, activeRoute }: ItemsProps) => (
  <Container direction="row" gap={2} textDecoration="none">
    {items.map(item => {
      const isLast = items.indexOf(item) === items.length - 1;
      const isActive = item.href === activeRoute;
      return (
        <>
          <Link key={item.href} href={item.href} data-is-last={isLast} data-is-active={isActive}>
            <Text variant="label-3" color={isActive ? 'primary' : 'quaternary'}>
              {item.label}
            </Text>
          </Link>
          {!isLast && (
            <Text variant="label-3" color="quaternary">
              /
            </Text>
          )}
        </>
      );
    })}
  </Container>
);

const Container = styled(Stack)`
  grid-column: 2 / 3;
  grid-row: 1;
  a {
    text-decoration: none;
  }
`;

export default Breadcrumb;
