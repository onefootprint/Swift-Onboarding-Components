import type { SharedState } from '..';

type SelectBusinessProps = {
  state: SharedState;
  onCreateNewBusiness: () => void;
};

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const BusinessList = ({ state, onCreateNewBusiness }: SelectBusinessProps) => {
  // TODO: fetch the list of businesses and show them.
  // If the user selects an existing business, call useBusinessOnboardingMutation and then state.onDone
  // If there are 0 existing businesses OR if the user clicks "Create new business," call onCreateNewBusiness().
  return null;
};

export default BusinessList;
