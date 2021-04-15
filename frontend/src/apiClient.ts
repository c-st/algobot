export const getRewardCollectionSettings = async (address: string) =>
  fetch(`/api/reward-collection?address=${address}`).then((response) =>
    response.json()
  );

export const updateRewardCollectionSettings = async (requestBody: any) =>
  await fetch("/api/reward-collection", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  }).then((response) => response.json());
