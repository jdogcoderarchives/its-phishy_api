/**
 * Rate limit definitions
 */
export const rateLimits = [
  {
    plan: "base",
    minuteLimit: 15,
    hourLimit: 125,
    dayLimit: 1250,
  },
  {
    plan: "personal",
    minuteLimit: 25,
    hourLimit: 200,
    dayLimit: 2000,
  },
  {
    plan: "business",
    minuteLimit: 50,
    hourLimit: 400,
    dayLimit: 4000,
  },
  {
    plan: "enterprise",
    minuteLimit: 100,
    hourLimit: 800,
    dayLimit: 8000,
  },
];
