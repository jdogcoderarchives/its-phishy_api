import mongoose from "mongoose";

/**
 * The model for a scam domain record
 * @typedef {object} Domain
 * @property {string} id.required - The ID of the record (generated automatically)
 * @property {string} domain.required - The domain to be reported
 * @property {string} type.required - The type of the domain (Spam, Malware, Phishing, etc.)
 * @property {string} reason.required - The reason for reporting the domain
 * @property {string} reportedBy.required - Person who reported the domain
 * @property {string} reportedByID.required - The ID of the person who reported the domain (generated automatically)
 * @property {string} dateReported.required - The date the link was reported (generated automatically)
 *
 */
interface Domain extends mongoose.Document {
  id: string;
  domain: string;
  type: string;
  reason: string;
  reportedBy: string;
  reportedByID: string;
  dateReported: Date;
}

const domainSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "Link ID is required"],
    unique: true,
  },
  domain: {
    type: String,
    required: [true, "Domain is required"],
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

export { Domain };
export const DomainModel = mongoose.model<Domain>("Domain", domainSchema);
