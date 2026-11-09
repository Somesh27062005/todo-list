import jwt from "jsonwebtoken";
const { verify } = jwt;

export function verifyToken(req, res, next) {
  // Get token from cookie
  const encodedToken = req.cookies?.token;

  if (!encodedToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const secretKey = process.env.SECRET_KEY || "abcdef";
    const decodedToken = verify(encodedToken, secretKey);
    req.user = decodedToken;
    return next();
  } catch {
    return res.status(401).json({ message: "Session expired" });
  }
}
