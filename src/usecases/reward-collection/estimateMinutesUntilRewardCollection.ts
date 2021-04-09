const PARTICIPATING_ALGOS = 5236812007;
const REWARDS_PER_BLOCK = 41.5;
const BLOCK_TIME = 4.3;

// TODO: automatically update constants (with caching)
export function estimateMinutesUntilRewardCollection(
  balance: number,
  targetRewards: number
) {
  const REWARDS_PER_SECOND = REWARDS_PER_BLOCK / BLOCK_TIME;
  const REWARDS_PER_SECOND_PER_ALGO = REWARDS_PER_SECOND / PARTICIPATING_ALGOS;
  const timeInSeconds = targetRewards / (balance * REWARDS_PER_SECOND_PER_ALGO);
  return Math.ceil(timeInSeconds / 60);
}