import jwt from "jsonwebtoken";
const { verify } = jwt;

export function verifyToken(req, res, next) {
  //get token from cookie
  const encodedToken = req.cookies?.token;
  //if encodedtoken not found
  if (encodedToken === undefined) {
    res.status(401).json({ message: "Unauthorized" });
  } else {
    try {
      //verify token
      let secretKey = process.env.SECRET_KEY || "abcdef";
      let decodedToken = verify(encodedToken, secretKey);
      req.user = decodedToken;
      //forward req to next
      next();
    } catch (err) {
      res.status(401).json({ message: "Session expired" });
    }
  }
}
