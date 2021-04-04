# Collect rewards

**Target Address**: "ABCD123" (address to collect rewards for)
**Algobot Address**: "BBBB123" (address to send transactions from)

## How it works

### Funding

Example:

- User transfers 2 ALGOs from Target Address to Algobot Address
- Algobot records incoming transactions ("From address ABCD123 I received 2 ALGOs") -> target address is funded

| Target Address | Amount funded |
| -------------- | ------------: |
| ABCD123        |        2 ALGO |

### Collecting rewards regularly

- User enables reward collection for their Target address
- In order to claim rewards Algobot sends a transaction of 0.0 ALGO to Target Address
- Transaction fees are paid from the Algobot address, but are deducted from user's funding amount at the same time

## Example requests

StartCollectingRewardsCommand:

```json
{
  "address": "E6FYJDBQE2ER4M3YAOIT2LLPBJTKBADSPU34Q5RFONQIFIK7UHKD3U3TGY",
  "minimumRewardToCollect": 5
}
```
