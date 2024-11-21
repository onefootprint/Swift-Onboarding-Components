import { IcoMinusSmall16, IcoPlusSmall16 } from '@onefootprint/icons';
import type {
  CreateOnboardingConfigurationRequest,
  OnboardingConfiguration,
} from '@onefootprint/request-types/dashboard';
import { LoadingSpinner } from '@onefootprint/ui';
import useDiffPlaybooks from './hooks/use-diff-playbooks';

type PlaybookDiffProps = {
  currentPlaybook: OnboardingConfiguration;
  newPlaybookPayload: CreateOnboardingConfigurationRequest;
};

const PlaybookDiff = ({ currentPlaybook, newPlaybookPayload }: PlaybookDiffProps) => {
  const diffMutation = useDiffPlaybooks({
    currentPlaybook,
    newPlaybookPayload: newPlaybookPayload,
  });

  return (
    <>
      {diffMutation.isPending && (
        <div className="mt-3 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      {diffMutation.data?.length && (
        <ul className="flex flex-col gap-6">
          {diffMutation.data.map(diff => (
            <li key={diff.label} className="flex flex-col gap-3">
              <h3 className="text-secondary text-label-3">{diff.label}</h3>
              {diff.changes.map(change => (
                <div
                  key={change.alias}
                  className="flex flex-col gap-0.5 border-l-2 border-solid border-info rounded-xs"
                >
                  <div className="flex items-center gap-2 py-1 px-2 text-tertiary text-body-3 bg-primary">
                    <IcoMinusSmall16 color="tertiary" />
                    {change.old}
                  </div>
                  <div className="flex items-center gap-2 py-1 px-2 text-info text-label-3 bg-info">
                    <IcoPlusSmall16 color="info" />
                    {change.updated}
                  </div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default PlaybookDiff;
