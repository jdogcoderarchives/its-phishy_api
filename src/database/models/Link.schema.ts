import mongoose from "mongoose";

/**
 * @openapi
 * definitions:
 *   ScamLink:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *       link:
 *         type: string
 *       type:
 *        type: string
 *       reportedBy:
 *        type: string
 *       reportedByID:
 *        type: string
 *       dateReported:
 *         type: string
 *         format: date
 */
interface Link extends mongoose.Document {
  id: string;
  link: string;
  type: string;
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
  type: {
    type: String,
    // enum: ["unknown", "discord", "instagram", "other"],
    required: [true, "Type is required"],
    default: "unknown",
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
