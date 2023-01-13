import mongoose from "mongoose";

/**
 * The model for an scam email record
 * @typedef {object} Email
 * @property {string} id.required - The ID of the record (generated automatically)
 * @property {string} email.required - The email to be reported
 * @property {string} type.required - The type of the email (Spam, Malware, Phishing, etc.)
 * @property {string} reason.required - The reason for reporting the email
 * @property {string} reportedBy.required - The person who reported the email
 * @property {string} reportedByID.required - The ID of the person who reported the email (generated automatically)
 * @property {string} dateReported.required - The date the email was reported (generated automatically)
 */

interface Email extends mongoose.Document {
  id: string;
  email: string;
  type: string;
  reason: string;
  reportedBy: string;
  reportedByID: string;
  dateReported: Date;
}

const emailSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "Link ID is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  type: {
    type: String,
    required: [true, "Type is required"],
  },
  reason: {
    type: String,
    required: [true, "Reason is required"],
  },
  reportedBy: {
    type: String,
    required: [true, "Reported By is required"],
  },
  reportedByID: {
    type: String,
    required: [true, "Reported By ID is required"],
  },
  dateReported: {
    type: Date,
    default: Date.now,
    required: [true, "Date is required"],
  },
});

export { Email };
export const EmailModel = mongoose.model<Email>("Email", emailSchema);
