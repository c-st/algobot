<script lang="ts">
  import { address, addressValid } from "../stores";
</script>

<div>
  <div class="relative rounded-md shadow-sm">
    <input
      on:change
      id="address"
      type="text"
      pattern="[A-Z0-9]{58}"
      bind:value={$address}
      placeholder="ALGO public address"
      class="font-mono text focus:ring-gray-400 focus:border-gray-400 block w-full sm:text-xs border-gray-300 rounded-md"
    />
    <div
      class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
    >
      <div class="flex">
        <span
          class="{$address.length === 0
            ? 'hidden'
            : 'opacity-95'} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {$addressValid
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'}"
        >
          {$addressValid ? "Valid" : "Check address"}
        </span>
      </div>
    </div>
  </div>
</div>

<style>
</style>
