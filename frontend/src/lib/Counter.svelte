<script lang="ts">
  let count: number = 0
  const increment = () => {
    count += 1
  }
</script>

<button on:click={increment} class="bg-gray-200">
  Clicks: {count}
</button>

<style>
  button {
    font-family: inherit;
    font-size: inherit;
    padding: 0.5em 1em;
    border-radius: 2em;
    outline: none;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }
</style>
