import { cx } from 'class-variance-authority';
import Link from 'next/link';

type NavigationLinkProps = {
  children: React.ReactNode;
  isSelected: boolean;
  href: string;
  onClick?: () => void;
  className?: string;
};

const NavigationLink = ({ children, isSelected, href, onClick, className }: NavigationLinkProps) => {
  return (
    <Link
      className={cx('p-3 rounded hover:bg-secondary block w-full transition-colors duration-100', className, {
        'text-primary text-label-3': isSelected,
        'text-tertiary text-body-3 hover:bg-secondary': !isSelected,
      })}
      href={href}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default NavigationLink;
