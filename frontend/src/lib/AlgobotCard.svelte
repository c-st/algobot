<script lang="ts">
  import AddressInput from "./AddressInput.svelte";
  import Toggle from "./ui/Toggle.svelte";
  import AmountInput from "./AmountInput.svelte";
  import Row from "./Row.svelte";
  import {
    address,
    addressValid,
    minimumClaimAmount,
    rewardCollectionSettings,
  } from "../stores";

  async function addressEntered() {
    if ($addressValid) {
      const response = await fetch(
        `/api/reward-collection?address=${$address}`
      ).then((response) => response.json());
      console.log(response);
      rewardCollectionSettings.set(response);
      if (response.minimumRewardsToCollect) {
        minimumClaimAmount.set(response.minimumRewardsToCollect);
      }
    } else {
      rewardCollectionSettings.set(undefined);
    }
  }
</script>

<div
  class="bg-gray-50 overflow-hidden shadow rounded-lg divide-y divide-gray-200"
>
  <div class="px-4 py-5 sm:px-6">
    <span class="text-xl font-medium text-gray-700 mr-1">
      &#x1F916; Algobot
    </span>
    <span class="text-lg text-gray-500">Algorand Reward Collector</span>
  </div>
  <div class="px-4 py-5 sm:p-6">
    <dl class="sm:divide-y sm:divide-gray-200">
      <Row>
        <span slot="title">Algo address</span>
        <AddressInput slot="content" on:change={addressEntered} />
      </Row>

      <Row>
        <span slot="title">Pending rewards</span>
        <span slot="content"
          ><span class="font-mono"
            >{$rewardCollectionSettings?.pendingRewards}</span
          > ALGO</span
        >>
      </Row>

      <Row>
        <span slot="title" class="pt-2">Minimum amount to claim</span>
        <span slot="content"><AmountInput /></span>
      </Row>

      <Row>
        <span slot="title" class="pt-2">Enable bot</span>
        <span slot="content"><Toggle /></span>
      </Row>

      <Row>
        <span slot="title" class="pt-2">What does it do?</span>
        <span slot="content"
          >Algobot regularly sends <span class="font-mono">0.00</span> ALGO to the
          address specified above. This incoming transfer makes your account claim
          your pending rewards and adds them to your balance. Fees for these transactions
          are covered by depositing funds in advance.</span
        >
      </Row>
    </dl>
  </div>
</div>

<style>
</style>
