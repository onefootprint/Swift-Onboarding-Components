import type { TimelinePlaybook } from '@onefootprint/types/src/data/onboarding-decision';
import { LinkButton } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';

type PlaybookLinkProps = {
  playbook: TimelinePlaybook;
};

const PlaybookLink = ({ playbook }: PlaybookLinkProps) => {
  const router = useRouter();
  const openPlaybook = () => {
    router.push({
      pathname: '/playbooks',
      query: { onboarding_config_id: playbook.id },
    });
  };

  return (
    <LinkButton size="compact" onClick={openPlaybook}>
      {playbook.name}
    </LinkButton>
  );
};

export default PlaybookLink;
