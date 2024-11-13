import { cx } from 'class-variance-authority';
import React from 'react';
import type { HTMLAttributes } from 'react';

export type BreadcrumbProps = {
  'aria-label': string;
  children: React.ReactNode;
  separator?: string;
  className?: string;
} & HTMLAttributes<HTMLElement>;

const Breadcrumb = ({ children, separator = '/', className, ...props }: BreadcrumbProps) => {
  return (
    <nav
      className={cx(
        'flex flex-row gap-2',
        '[&>a]:no-underline [&>a:hover]:text-tertiary [&>a:hover]:underline',
        className,
      )}
      {...props}
    >
      <ol className="flex flex-row gap-2">
        {React.Children.map(children, (child, index) => (
          <>
            {child}
            {index !== React.Children.count(children) - 1 && (
              <li className="text-label-3 text-tertiary">{separator}</li>
            )}
          </>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
