import { cx } from 'class-variance-authority';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
};

const SectionTitle = ({ title, subtitle, align = 'center' }: SectionTitleProps) => (
  <div
    className={cx('flex flex-col gap-2 items-center justify-center max-w-[680px] mx-auto w-full', {
      'items-start': align === 'left',
    })}
  >
    <h3 className={cx('text-center text-display-3 md:text-display-2 ', { 'text-left': align === 'left' })}>{title}</h3>
    {subtitle && (
      <h4
        className={cx('text-center text-display-5 md:text-display-4 text-secondary', {
          'text-left': align === 'left',
        })}
      >
        {subtitle}
      </h4>
    )}
  </div>
);

export default SectionTitle;
