import jwt from "jsonwebtoken";
const { verify } = jwt;

export function verifyToken(req, res, next) {
  //get token from cookie
  const encodedToken = req.cookies.token;
  //if encodedtoken not found
  if (encodedToken === undefined) {
    res.status(401).json({ nessage: Unauthorized });
  } else {
    try {
      //verify token
      let decodedToken = verify(encodedToken, "abcdef");
      req.user = decodedToken;
      //forward req to next
      next();
    } catch (err) {
      res.status(401).json({ nessage: "Session expired" });
    }
  }
}
