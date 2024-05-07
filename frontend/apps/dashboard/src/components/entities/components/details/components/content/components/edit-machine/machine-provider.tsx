import { useMachine } from '@xstate/react';
import constate from 'constate';

import editStateMachine from './machine';

const useLocalMachine = () => useMachine(editStateMachine);

const [EditProvider, useEditMachine] = constate(useLocalMachine);

export default EditProvider;

export { useEditMachine };
