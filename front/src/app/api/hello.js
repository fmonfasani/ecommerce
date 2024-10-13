import { getSession } from "next-auth/next";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) return res.status(403).send("forbidden");
  res.status(200).json({ name: "John Doe" });
}
