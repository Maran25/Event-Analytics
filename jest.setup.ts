import setupTestDB from "./tests/setupTestDB";

export default async () => {
  await setupTestDB();
  console.log("Global setup completed.");
};
