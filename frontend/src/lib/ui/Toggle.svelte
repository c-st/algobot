<script lang="ts">
  export let enabled: boolean;
</script>

<button
  on:click
  type="button"
  class="{enabled
    ? 'bg-green-600'
    : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  aria-pressed="false"
>
  <span class="sr-only">Use setting</span>
  <span
    aria-hidden="true"
    class="{enabled
      ? 'translate-x-5'
      : 'translate-x-0'} translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
  />
</button>
