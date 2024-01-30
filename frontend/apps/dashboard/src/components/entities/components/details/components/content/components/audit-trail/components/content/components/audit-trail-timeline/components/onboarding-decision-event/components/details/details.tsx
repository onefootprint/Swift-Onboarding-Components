import { Drawer, LinkButton, Stack, Tab, Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

import useEntityId from '@/entity/hooks/use-entity-id';

import FieldValidations from './components/field-validations';
import Rules from './components/rules';
import useEntityRuleSetResult from './hooks/use-entity-rule-set-result';

const Details = () => {
  const { t } = useTranslation('common', {
    keyPrefix:
      'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details',
  });
  const { isLive } = useSession();
  const id = useEntityId();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const options = [
    { value: 'rules', label: t('drawer.tabs.rules') },
    { value: 'field-validations', label: t('drawer.tabs.field-validations') },
  ];
  const [tab, setTab] = useState(options[0].value);
  const { data, errorMessage, isLoading } = useEntityRuleSetResult({
    id,
  });
  const showRulesTab = isLive && data && data.hasRuleResults;

  const handleChange = (value: string) => {
    setTab(value);
  };

  return (
    <>
      <Stack align="center" justify="center" gap={2}>
        <Stack align="center" justify="center" marginLeft={1} marginRight={1}>
          ·
        </Stack>
        <LinkButton
          onClick={() => {
            setDrawerOpen(true);
          }}
          size="compact"
        >
          {t('view-details')}
        </LinkButton>
      </Stack>
      <Drawer
        open={isDrawerOpen}
        title={t(showRulesTab ? 'drawer.details-title' : 'drawer.field-title')}
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        {showRulesTab ? (
          <Stack direction="column" gap={7}>
            <Tabs>
              {options.map(({ value, label }) => (
                <Tab
                  key={value}
                  onClick={() => handleChange(value)}
                  selected={tab === value}
                >
                  {label}
                </Tab>
              ))}
            </Tabs>
            {tab === 'rules' && (
              <Rules
                data={data}
                errorMessage={errorMessage}
                isLoading={isLoading}
              />
            )}
            {tab === 'field-validations' && <FieldValidations entityId={id} />}
          </Stack>
        ) : (
          <FieldValidations entityId={id} />
        )}
      </Drawer>
    </>
  );
};

export default Details;
