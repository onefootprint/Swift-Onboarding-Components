import type { TimelinePlaybook } from '@onefootprint/types/src/data/onboarding-decision';
import { LinkButton } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';
import useSession from 'src/hooks/use-session';

type PlaybookLinkProps = {
  playbook: TimelinePlaybook;
};

const PlaybookLink = ({ playbook }: PlaybookLinkProps) => {
  const router = useRouter();
  const entityId = useEntityId();
  const session = useSession();

  const openPlaybook = () => {
    const mode = session.isLive ? 'live' : 'sandbox';
    const { id, ...query } = router.query;
    router.push({
      pathname: `/users/${entityId}/playbook/${playbook.id}`,
      query: { ...query, mode },
    });
  };

  return <LinkButton onClick={openPlaybook}>{playbook.name}</LinkButton>;
};

export default PlaybookLink;
