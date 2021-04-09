# Algobot

> A bot which regularly sends 0.00 ALGO to a configured address in order to compound rewards.
> Transaction fees are covered by previously depositing funds.

## Features

1. Regularly send transactions to an Algorand account in order to make it claim its reward.
2. Transaction fees are paid by depositing Algo from the Algorand account for which rewards are to be collected.

- Enter Algo address
- Set amount of minimum reward to harvest
- Add funding (deposit ALGO for covering fees of 0.001 ALGO/transaction)

[[doc/01 - Collect Rewards.md]]

### Feature list

- [x] Regularly collect rewards (based on Step function + Lambda)
- [ ] API for configuring settings
- [ ] Frontend for configuring settings
- [ ] Fund account with transaction fees

### Future optimizations

- 2FA/password once address has been registered
- Determine optimal interval for sending 0.00 ALGO (rewards should be significantly larger than transaction fees)
- Notify users if deposited fee is about to run out

## Getting started

### Initially bootstrap AWS Pipeline

- Configure new AWS profile: `algobot`
- Create GitHub personal access token (required permissions are `repo`, `admin:repo_hook`)
- In AWS account, create a secret named `github_token` with GitHub token (plaintext value)
- Run CDK bootstrap: `yarn cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess`
- Deploy build stack: `yarn cdk deploy AlgobotBuildStack`

### Frontend

tbd: Amplify Web-App (Vue/Preact/? + Vite + Typescript)

## Development notes

[Step Functions local](https://docs.aws.amazon.com/step-functions/latest/dg/sfn-local-docker.html)
[VSCode support](https://aws.amazon.com/blogs/compute/aws-step-functions-support-in-visual-studio-code/)
[Integration with EventBridge](https://docs.aws.amazon.com/step-functions/latest/dg/cw-events.html)
