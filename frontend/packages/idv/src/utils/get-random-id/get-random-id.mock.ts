import { type Mock, fn } from '@storybook/test';
import original from './get-random-id';

const getRandomID: Mock<[length?: number | undefined], string> = fn(original).mockName('getRandomID');

export default getRandomID;
