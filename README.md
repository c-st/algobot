# Algobot

> A bot which regularly sends 0.00 ALGO to a configured address in order to compound rewards.
> Transaction fees are covered by previously depositing funds.

## Getting started

Based on [AWS CDK Pipelines](https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/)

- Configure AWS profile named `algobot`
- Create GitHub personal access token (required permissions are `repo`, `admin:repo_hook`)
- In AWS account, create a secret named `github_token` with GitHub token
- Run CDK bootstrap: `yarn cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess`
- Deploy build stack: `yarn cdk deploy AlgobotBuildStack`

## Functionality

- Enter Target address
- Set interval (every n hours)
- Add funding (deposit ALGO for covering fees of 0.001 ALGO/transaction)

## Infrastructure

AWS Serverless
w. Amplify Web-App (Vue + Vite + Typescript)

AWS resources:

- API Gateway w. Lambda handlers (for web app)
- Lambda for sending transactions
- Trigger Lambda regularly via SQS (?)

## Future optimizations

- Determine optimal interval for sending 0.00 ALGO (rewards should be significantly larger than transaction fees)
