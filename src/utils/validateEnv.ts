// create a validateEnv function that returns true or false

export const validateEnv = (): { valid: boolean; message: string } => {
  if (!process.env.NODE_ENV) {
    return { valid: false, message: "Missing Node Env" };
  }

  if (!process.env.PORT) {
    return { valid: false, message: "Missing Port" };
  }

  if (!process.env.MONGO_URI) {
    return { valid: false, message: "Missing Mongo URI" };
  }

  if (!process.env.JWT_SECRET) {
    return { valid: false, message: "Missing JWT Secret" };
  }

  if (!process.env.GOOGLE_SAFE_BROWSING_API_KEY) {
    return { valid: false, message: "Missing Google Safe Browsing API Key" };
  }

  if (!process.env.PHISHERMAN_API_KEY) {
    return { valid: false, message: "Missing Phisherman API Key" };
  }

  if (!process.env.PHISH_REPORT_API_KEY) {
    return { valid: false, message: "Missing Phish Report API Key" };
  }

  if (!process.env.URLSCAN_API_KEY) {
    return { valid: false, message: "Missing URLScan API Key" };
  }

  if (!process.env.VIRUS_TOTAL_API_KEY) {
    return { valid: false, message: "Missing Virus Total API Key" };
  }

  if (!process.env.CHECK_PHISH_API_KEY ) {
    return { valid: false, message: "Missing Check Phish API Key" };
  }

  if (process.env.IP_QUALITY_SCORE_API_KEY) {
    return { valid: false, message: "Missing ipQualityScore API Key" };
  }

  return { valid: true, message: "Environment variables validated!" };
};
