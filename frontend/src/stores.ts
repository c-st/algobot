import { derived, writable } from "svelte/store";

type RewardCollectionSettings = {
  isEnabled: boolean;
  address: string;
  minimumRewardsToCollect?: number;
  pendingRewards: number;
};

export const address = writable("");
export const minimumClaimAmount = writable(0);
export const rewardCollectionSettings = writable<RewardCollectionSettings>(
  undefined
);

export const addressValid = derived(
  address,
  ($address) => !!$address.match(/^[A-Za-z0-9]{58}$/)
);
