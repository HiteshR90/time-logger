import { Request } from "express";

/**
 * Safely extract a route param as a string.
 * Express 5 types params as string | string[].
 */
export function getParam(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}
