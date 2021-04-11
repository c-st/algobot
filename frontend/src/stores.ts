import { derived, writable } from "svelte/store";

export const address = writable("");
export const addressValid = derived(address, ($address) =>
  !!$address.match(/^[A-Za-z0-9]{58}$/)
);
