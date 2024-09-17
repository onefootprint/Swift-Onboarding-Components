import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export function Setup() {
    createLifecyclePolicy("api");
    createLifecyclePolicy("enclave_pkg");
    createLifecyclePolicy("enclave_proxy_pkg");
}

function createLifecyclePolicy(repo: string) {
    const lsPolicy = new aws.ecr.LifecyclePolicy(`${repo}-ls-policy`, {
        repository: repo,
        policy: `{
        "rules": [
            {
                "rulePriority": 1,
                "description": "Expire images older than 14 days",
                "selection": {
                    "tagStatus": "untagged",
                    "countType": "sinceImagePushed",
                    "countUnit": "days",
                    "countNumber": 14
                },
                "action": {
                    "type": "expire"
                }
            },
            {
                "rulePriority": 2,
                "description": "Expire tagged images older than 90 days",
                "selection": {
                    "tagStatus": "tagged",
                    "countType": "sinceImagePushed",
                    "countUnit": "days",
                    "countNumber": 60,
                    "tagPrefixList": ["pr-"]
                },
                "action": {
                    "type": "expire"
                }
            }
        ]
    }
    `,
    });
}


