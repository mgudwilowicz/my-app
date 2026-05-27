import { verifyAccessToken } from "../util/jwt.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect: "Bearer <token>"

  console.log("authenticateToken middleware hit");

  if (!token) return res.sendStatus(401); // Unauthorized

  console.log("🚀 ~ authenticateToken ~ token:", token);
  try {
    const user = verifyAccessToken(token);
    console.log("🚀 ~ authenticateToken ~ user:", user);
    req.user = user; // attach user info to request
    next();
  } catch (err) {
    console.log(err);
    return res.sendStatus(403); // Forbidden if token invalid/expired
  }
};
