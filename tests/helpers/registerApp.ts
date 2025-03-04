import request from "supertest";
import server from "../../src/index";

export const registerApp = async ({
  name,
  id,
  token,
}: {
  name?: string;
  id: string;
  token: string;
}): Promise<{ apikey: string }> => {
  try {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ name: name ?? "Test App", id })
      .set("Authorization", `Bearer ${token}`);

    return res.body;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message)
  }
};
