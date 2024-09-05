import { fn } from '@storybook/test';
import * as actual from './get-random-id';

export * from './get-random-id';
const getRandomID = fn(actual.default).mockName('getRandomID');

export default getRandomID;
