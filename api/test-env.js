export default async function handler(req, res) {
  res.status(200).json({ token: process.env.EBAY_API_TOKEN || "No token found" });
}