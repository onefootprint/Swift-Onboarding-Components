import * as crypto from 'crypto';
import * as pulumi from '@pulumi/pulumi';

export enum StackEnvironment {
  Dev,
  DevEphemeral,
  Prod,
}

export type StackMetadata = {
  // Corresponds to pulumi.getStack() except for ephemeral environments
  shortStackName: string;
  environment: StackEnvironment;
};

export function GetStackMetadata(): StackMetadata {
  const stack = pulumi.getStack();

  let shortStackName = stack;
  let environment: StackEnvironment;

  if (pulumi.getStack().startsWith('dev-')) {
    environment = StackEnvironment.DevEphemeral;
    const stackNameHash = crypto
      .createHash('sha256')
      .update(`${pulumi.getStack()}`)
      .digest('hex')
      .substring(0, 8);

    shortStackName = `ephem-${stackNameHash}`;
  } else if (pulumi.getStack() === 'dev') {
    environment = StackEnvironment.Dev;
  } else if (pulumi.getStack() === 'prod') {
    environment = StackEnvironment.Prod;
  } else {
    throw 'Invalid stack name provided';
  }

  return {
    environment,
    shortStackName,
  };
}
