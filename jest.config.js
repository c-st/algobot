module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
process.env = Object.assign(process.env, {
  ALGOADDRESSES_TABLENAME: "AlgoAddresses",
  SECRET_ARN: "secret-arn",
  REWARD_COLLECTION_STATEMACHINE_ARN: "rewardcollection-arn"
});
