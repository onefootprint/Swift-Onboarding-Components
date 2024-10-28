import { useState } from 'react';
import type { SharedState } from '..';
import BusinessList from './business-list';
import NewBusinessIntroduction from './new-business-introduction';

type SelectBusinessProps = {
  state: SharedState;
};

enum Screen {
  /** Display the list of existing businesses. */
  BusinessList = 0,
  /** The user has either selected to create a new business OR there are no existing businesses to choose from. */
  NewBusinessIntroduction = 1,
}

const SelectBusiness = ({ state }: SelectBusinessProps) => {
  // TODO: start on Screen.BusinessList once we've implemented that screen
  const [screen, setScreen] = useState<Screen>(Screen.NewBusinessIntroduction);
  if (screen === Screen.BusinessList) {
    return <BusinessList state={state} onCreateNewBusiness={() => setScreen(Screen.NewBusinessIntroduction)} />;
  }
  return <NewBusinessIntroduction state={state} />;
};

export default SelectBusiness;
