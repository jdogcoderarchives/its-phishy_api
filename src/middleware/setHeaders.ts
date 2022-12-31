import { Request, Response, NextFunction } from "express";

export function setHeaders(req: Request, res: Response, next: NextFunction) {
  // Allows resource sharing for clients that are hosted on
  // Different domains. Useful for public APIs
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Restrict http - methods to a chosen few. This applies only
  // When the browser sends a Preflight request, e.g. when using
  // window.fetch().
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, DELETE, OPTIONS");

  // Add some basic cache control for requesting browsers
  // If you want no cache at all, uncomment this header
  res.setHeader("Cache-Control", "no-store, max-age=0");

  // You can also remove standard headers. In case of express,
  // the following will get rid of the X-Powered-By header
  res.removeHeader("X-Powered-By");

  // remove etag header
  res.removeHeader("ETag");

  // set connection header to close
  res.setHeader("Connection", "close");

  // Set the content type to JSON
  res.setHeader("Content-Type", "application/json");

  next();
}
