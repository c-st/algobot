<script lang="ts">
  import AddressInput from "./AddressInput.svelte";
  import Logo from "./Logo.svelte";
</script>

<main class="flex h-screen font-mono">
  <Logo />

  <div class="m-auto w-full md:w-full lg:w-1/2 px-6 flex flex-col md:flex-row">
    <div class="bg-gray-100 rounded-xl shadow-xl p-6 flex-grow space-y-3 border-gray-100 border-2">
      <h1 class="text-blue text-xl font-semibold">&#x1F916; Algobot (Type: Reward Collector)</h1>
      <AddressInput />
      <div class="flex flex-row-reverse">
        <figure class="text-gray-600">
          <p class="text-2xl"><span class="font-thin">1.2455</span> ALGO</p>
          <figcaption class="text-sm">Claimable rewards</figcaption>
        </figure>
      </div>
      <div class="flex-auto flex space-y-3 pt-2">
        <div class="flex-grow" />
        <button
          disabled
          class="w-32 h-12 flex font-mono items-center justify-center rounded-2xl bg-gray-700 text-white font-medium"
          type="submit">Start &#9654;</button
        >
      </div>
    </div>
    <div class="px-4 md:max-w-xs flex flex-col font-sans pt-4">
      <div class="flex-grow" />
      <h3 class="text-gray-700 text-sm font-semibold pb-1">What does it do?</h3>
      <p class="text-gray-700 text-sm italic">
        Algobot regularly sends 0.00 ALGO to your ALGO address. This incoming
        transfer makes your account claim your pending rewards and adds them to
        your balance.<br />
        Fees for these transactions are covered by depositing funds in advance.
      </p>
    </div>
  </div>
</main>

<style>
</style>
