import mongoose from "mongoose";

/**
 * A domain type
 * @typedef {object} Domain
 * @property {string} id.required - The ID
 * @property {string} domain.required - The domain
 * @property {string} type.required - The type
 * @property {string} reportedBy.required - The reportedBy
 * @property {string} reportedByID.required - The reportedByID
 * @property {string} dateReported.required - The dateReported
 *
 */
interface Domain extends mongoose.Document {
  id: string;
  domain: string;
  type: string;
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
