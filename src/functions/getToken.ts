import { Request } from "express";

/**
 * Gets a user's token & their X-Identity from the request headers
 * @param {Request} req Request
 * @returns {Object} The token as a string
 */
export function getToken(req: Request) {
  // get berer token from header
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    return bearerToken;
  }
  return null; // if not found
}
