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
  import Button from "./ui/Button.svelte";
  import {
    getRewardCollectionSettings,
    updateRewardCollectionSettings,
  } from "../apiClient";
  import CircularButton from "./ui/CircularButton.svelte";

  async function addressEntered() {
    if ($addressValid) {
      const currentSettings = await getRewardCollectionSettings($address);
      rewardCollectionSettings.set(currentSettings);

      if (currentSettings.minimumRewardsToCollect) {
        minimumClaimAmount.set(currentSettings.minimumRewardsToCollect);
      }
    } else {
      rewardCollectionSettings.set(undefined);
    }
  }

  async function toggleCollection() {
    const updatedSettings = await updateRewardCollectionSettings({
      ...$rewardCollectionSettings,
      enable: !$rewardCollectionSettings.rewardCollectionEnabled,
      minimumRewardsToCollect: $minimumClaimAmount,
    });
    console.log(updatedSettings);
    rewardCollectionSettings.set(updatedSettings);
  }

  async function updateAmount() {
    const updatedSettings = await updateRewardCollectionSettings({
      address: $address,
      enable: true,
      minimumRewardsToCollect: $minimumClaimAmount,
    });
    rewardCollectionSettings.set(updatedSettings);
  }
</script>

<div
  class="bg-gray-50 overflow-hidden shadow rounded-lg divide-y divide-gray-200"
>
  <div class="px-4 py-5 sm:px-6 flex">
    <span class="text-xl font-medium text-gray-700 mr-1">
      &#x1F916; Algobot
    </span>
    <span class="text-lg text-gray-500">Algorand Reward Collector</span>
    <div class="flex flex-grow" />
    {#if $addressValid}<span class=""
        ><CircularButton on:click={addressEntered} /></span
      >{/if}
  </div>
  <div class="px-4 py-5 sm:p-6">
    <dl class="sm:divide-y sm:divide-gray-200">
      <Row>
        <span slot="title">Algo address</span>
        <span slot="content">
          <AddressInput on:change={addressEntered} />
        </span>
      </Row>

      {#if $rewardCollectionSettings}
        <Row>
          <span slot="title" class="pt-2">Minimum amount to claim</span>
          <span slot="content" class="flex space-x-4"
            ><AmountInput bind:value={$minimumClaimAmount} />
            {#if $rewardCollectionSettings.rewardCollectionEnabled && $minimumClaimAmount !== $rewardCollectionSettings.minimumRewardsToCollect}
              <Button>
                <span slot="content" on:click={updateAmount}
                  >Update settings</span
                >
              </Button>
            {/if}
          </span>
        </Row>

        <Row>
          <span slot="title">Pending rewards</span>
          <span slot="content"
            ><span class="font-mono"
              >{$rewardCollectionSettings.pendingRewards}</span
            > ALGO</span
          >>
        </Row>

        <Row>
          <span slot="title" class="pt-2">Enable bot</span>
          <span slot="content"
            ><Toggle
              on:click={toggleCollection}
              enabled={$rewardCollectionSettings.rewardCollectionEnabled}
            /></span
          >
        </Row>
      {/if}

      <Row>
        <span slot="title" class="pt-2">What does it do?</span>
        <span slot="content"
          >Algobot regularly sends <span class="font-mono">0.00</span> ALGO to
          the address specified above. This incoming transfer makes your account
          claim your pending rewards and adds them to your balance.<br />Fees
          for these transactions are covered by depositing funds in advance.</span
        >
      </Row>
    </dl>
  </div>
</div>
