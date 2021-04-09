# Collect rewards

**Target Address**: "ABCD123" (address to collect rewards for)
**Algobot Address**: "BBBB123" (address where transactions are sent from)

## How it works

Using the configuration endpoints, settings for reward collection can be adjusted for an address (see [[RewardCollection.rest]]). These settings are stored in a DynamoDB table.

| Target Address | Amount funded | Reward collection enabled | Minimum reward | ExecutionId |
| -------------- | ------------: | ------------------------: | -------------: | ----------: |
| ABCD123        |        2 ALGO |                     false |            3.0 |             |

When the boolean value for `rewardCollectionEnabled` is toggled, an instance of a state machine is started (or stopped). If an execution runs into an error during execution, the value is set to `false`.
In order to create a link between Target Address and running state machine its executionId is recorded.

### 1. Funding

In order to start collecting rewards a user first has to transfer Algo to Algobot in order to cover future transaction fees.

- User transfers 2 ALGOs from Target Address to Algobot Address
- Algobot records incoming transactions ("From address ABCD123 I received 2 ALGOs") -> target address is funded

### 2. Collecting rewards regularly

- User enables reward collection for their Target address
- In order to claim rewards Algobot sends a transaction of 0.0 ALGO to Target Address
- Transaction fees are paid from the Algobot address, but are deducted from user's funding amount at the same time

## Configuring settings

## Examples

```json
# Testnet
{
  "address": "E6FYJDBQE2ER4M3YAOIT2LLPBJTKBADSPU34Q5RFONQIFIK7UHKD3U3TGY",
  "minimumRewardToCollect": 0
}
```
