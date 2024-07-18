// import jwt from "jsonwebtoken";

// export const verifyToken = (req, res, next) => {
//   if (!req.headers["authorization"]) {
//     return res.status(403).send("An authorization header is required for authentication");
//   }

//   // split on space for Bearer <token>, not required
//   const tokenArr = req.headers["authorization"].split(" ");
//   const token = tokenArr[tokenArr.length - 1];

//   if (!token) {
//     return res.status(403).send("A token is required for authentication");
//   }

//   try {
//     // verify token is still active
//     const decoded = jwt.verify(token, process.env.TOKEN_KEY);
//     req.user = decoded;
//     // {
//     //   _id: '63e2acfa66467c2fed1b89ad',
//     //   email: 'curtwphillips@gmail.com',
//     //   iat: 1675799831,
//     //   exp: 1675807031,
//     // }
//   } catch (err) {
//     // expired or not properly signed token
//     return res.status(401).send("Invalid token");
//   }

//   return next();
// };
