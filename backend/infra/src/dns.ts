import * as aws from '@pulumi/aws';
import { Config } from './config';
import * as crypto from 'crypto';

export type DnsConfig = {
  domainBaseName: string;
  apiPrefixHost: string;
  hostedZone: aws.route53.GetZoneResult;
};

// hostname's cannot be longer than 63 characters, but we truncate at 32
// to prevent unreadable names
const MAX_HOST_NAME_LENGTH = 32;
const TRUNCATE_LENGTH = 20;

export async function LoadDnsConfig(constants: Config): Promise<DnsConfig> {
  let apiPrefix = constants.domain.prefix;

  if (apiPrefix.length > MAX_HOST_NAME_LENGTH) {
    const hostHash = crypto
      .createHash('sha256')
      .update(apiPrefix)
      .digest('hex')
      .substring(0, 8);

    const truncated = apiPrefix.substring(0, TRUNCATE_LENGTH);
    apiPrefix = `${truncated}-${hostHash}`;
  }

  return {
    hostedZone: await aws.route53.getZone({ name: constants.domain.base }),
    domainBaseName: constants.domain.base,
    apiPrefixHost: apiPrefix,
  };
}
