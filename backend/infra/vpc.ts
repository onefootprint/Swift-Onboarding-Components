import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"

export type VpcRegion = {
    vpc: awsx.ec2.Vpc;
    provider: aws.Provider;
};

export function CreateRegionalVPC(region: Region): VpcRegion {
    const stack = pulumi.getStack();
    const provider = new aws.Provider(`vpc-provider-${region}`, { region });

    const vpc = new awsx.ec2.Vpc(`vpc-${stack}-${region}`, {
        tags: { "stack": stack },
        numberOfAvailabilityZones: 2, // TODO: is this enough?
    }, { provider });    

    return {
        vpc,
        provider
    }
}