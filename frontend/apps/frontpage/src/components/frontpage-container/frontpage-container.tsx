import { cx } from 'class-variance-authority';

type FrontpageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const FrontpageContainer = ({ children, className }: FrontpageContainerProps) => {
  return <div className={cx('relative max-w-[95%] mx-auto md:max-w-[1200px] w-full', className)}>{children}</div>;
};

export default FrontpageContainer;
