import type { ParseKeys } from 'i18next';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { cx } from 'class-variance-authority';
import BaseCard from '../../components/base-card';
import CardTitle from '../../components/card-title';

const rows = [
  {
    key: 'fail',
    color: 'error',
    value: '18 (45%)',
  },
  {
    key: 'fail-and-manual-review',
    color: 'warning',
    value: '10 (25%)',
  },
  {
    key: 'step-up',
    color: 'info',
    value: '18 (45%)',
  },
  {
    key: 'pass-and-manual-review',
    color: 'success',
    value: '18 (45%)',
  },
];

const Backtest = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.backtest.illustration.outcomes',
  });

  return (
    <BaseCard ref={cardRef} className="overflow-hidden select-none group">
      <CardTitle title={t('title')} subtitle={t('subtitle')} />
      <div className="relative w-full h-full">
        <div
          className={cx(
            'absolute top-0 left-7 min-w-[740px] origin-top-left',
            'flex flex-col gap-5 p-5 overflow-hidden',
            'border border-solid rounded border-tertiary',
            'bg-primary shadow-sm',
            'group-hover:-rotate-2 group-hover:shadow-lg',
            'transition-transform-shadow duration-500 ease-in-out',
          )}
        >
          <div className="flex flex-col gap-2">
            <p className="text-label-3">{t('title')}</p>
            <p className="text-body-3">{t('subtitle')}</p>
          </div>
          <div className="flex flex-col border border-solid rounded border-tertiary ">
            {rows.map(row => (
              <div
                key={row.key}
                className="flex justify-between px-4 py-3 border-b border-solid border-tertiary last:border-0"
              >
                <p
                  className={cx('text-label-3', {
                    'text-error': row.color === 'error',
                    'text-warning': row.color === 'warning',
                    'text-info': row.color === 'info',
                    'text-success': row.color === 'success',
                  })}
                >
                  {t(`${row.key}` as unknown as ParseKeys<'common'>)}
                </p>
                <p className="text-body-3">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

export default Backtest;
