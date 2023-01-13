import mongoose from "mongoose";

/**
 * The model for a scam link record
 * @typedef {object} Link
 * @property {string} id.required - The ID of the record (generated automatically)
 * @property {string} link.required - The link to be reported
 * @property {string} flatLink.required - Flattened version of the link. (domain)
 * @property {string} type.required - The type of the link (Spam, Malware, Phishing, etc.)
 * @property {string} reason.required - The reason for reporting the link
 * @property {string} reportedBy.required - The person who reported the link
 * @property {string} reportedByID.required - The ID of the person who reported the link (generated automatically)
 * @property {string} dateReported.required - The date the link was reported (generated automatically)
 */
interface Link extends mongoose.Document {
  id: string;
  link: string;
  flatLink: string;
  type: string;
  reason: string;
  reportedBy: string;
  reportedByID: string;
  dateReported: Date;
}

const linkSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "Link ID is required"],
    unique: true,
  },
  link: {
    type: String,
    required: [true, "Link is required"],
    unique: true,
  },
  flatLink: {
    type: String,
    required: [true, "Flat Link is required"],
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

export { Link };
export const LinkModel = mongoose.model<Link>("Link", linkSchema);
