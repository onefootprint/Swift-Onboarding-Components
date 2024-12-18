import { Fragment, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { cx } from 'class-variance-authority';
import { uniqueId } from 'lodash';
import BaseCard from '../../components/base-card';
import CardTitle from '../../components/card-title';
import GrabbedChip from './components/grabbed-chip';
import RuleTag from './components/rule-tag';
import type { RuleTagProps } from './components/rule-tag';

const ruleTableContent: RuleTagProps[][] = [
  [
    {
      signal: 'phone_number',
      op: 'is',
      list: '@blocked_phones',
    },
    {
      signal: 'id_flagged',
      op: 'is',
      list: undefined,
    },
  ],
  [
    {
      signal: 'subject_deceased',
      op: 'is',
      list: undefined,
    },
    {
      signal: 'address_input_is_po_box',
      op: 'is not',
      list: undefined,
    },
    {
      signal: 'dob_located_coppa_alert',
      op: 'is not',
      list: undefined,
    },
    {
      signal: 'multiple_records_found',
      op: 'is',
      list: undefined,
    },
  ],
  [
    {
      signal: 'phone_number',
      op: 'is',
      list: '@blocked_phones',
    },
    {
      signal: 'ssn_input_is_invalid',
      op: 'is',
      list: undefined,
    },
  ],
];

const BuildRules = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.build-rules',
  });

  return (
    <BaseCard className="overflow-hidden group" ref={cardRef}>
      <CardTitle title={t('title')} subtitle={t('subtitle')} />
      <div className="relative h-full">
        <div
          className={cx(
            'flex flex-col gap-5',
            'border border-solid rounded border-tertiary',
            'bg-primary p-8 shadow-sm',
            'w-full h-full md:w-[720px] origin-bottom-right',
            'absolute -bottom-2 left-7',
            'group-hover:shadow-lg group-hover:rotate-2',
            'transition-transform-shadow duration-1000 ease-in-out',
          )}
        >
          <div className="flex flex-col gap-2">
            <p className="text-label-1 text-error">Fail</p>
            <p className="text-body-2 text-secondary">User will be marked as failed</p>
          </div>
          {ruleTableContent.map((row, rowIndex) => (
            <div className="flex flex-row flex-wrap items-center gap-x-1 gap-y-3" key={uniqueId(`row-${rowIndex}-`)}>
              <p className="text-body-3 text-tertiary">if</p>
              {row.map(({ signal, op, list }, index) => (
                <Fragment key={uniqueId(`rule-${index}-`)}>
                  <RuleTag signal={signal} op={op} list={list} />
                  {index < row.length - 1 && <p className="text-body-3 text-tertiary">and</p>}
                </Fragment>
              ))}
            </div>
          ))}
        </div>
        <div
          className={cx(
            'absolute -top-2 -right-[200px]',
            'group-hover:right-[140px] group-hover:-rotate-12 group-hover:top-12',
            'transition-all duration-[2000ms] ease-in-out',
          )}
        >
          <GrabbedChip />
        </div>
      </div>
    </BaseCard>
  );
};

export default BuildRules;
