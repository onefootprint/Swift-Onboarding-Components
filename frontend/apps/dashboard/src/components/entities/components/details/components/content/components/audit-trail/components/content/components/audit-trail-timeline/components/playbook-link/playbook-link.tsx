import type { TimelinePlaybook } from '@onefootprint/types/src/data/onboarding-decision';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import PlaybookDetailsDrawer from 'src/components/playbook-details-drawer';
import useFilters from 'src/hooks/use-filters';

type PlaybookLinkProps = {
  playbook: TimelinePlaybook;
};

const PlaybookLink = ({ playbook }: PlaybookLinkProps) => {
  const { push } = useFilters<{ onboarding_config_id?: string }>({
    onboarding_config_id: undefined,
  });

  const openPlaybook = () => {
    push({ onboarding_config_id: playbook.id });
  };

  return (
    <>
      <LinkButton onClick={openPlaybook}>{playbook.name}</LinkButton>
      <PlaybookDetailsDrawer />
    </>
  );
};

export default PlaybookLink;
