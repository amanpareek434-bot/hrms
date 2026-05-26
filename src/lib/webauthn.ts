// WebAuthn helper config. Server-side only.

import { NextRequest } from "next/server";

export function getRpInfo(req: NextRequest): { rpID: string; origin: string } {
  // Origin comes from the request — supports localhost in dev, custom domain in prod.
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;
  // rpID must be the hostname only (no port, no protocol). Allowed values: full hostname or its parent.
  const rpID = url.hostname;
  return { rpID, origin };
}

export const RP_NAME = "PeopleHub HRMS";
