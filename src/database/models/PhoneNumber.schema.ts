import mongoose from "mongoose";

/**
 * The model for an scam phone number record
 * @typedef {object} PhoneNumber
 * @property {string} id.required - The ID of the record (generated automatically)
 * @property {string} phoneNumber.required - The phone number to be reported (000-000-0000 format)
 * @property {string} type.required - The type of the phone number (Spam, Malware, Phishing, etc.)
 * @property {string} reason.required - The reason for reporting the phone number
 * @property {string} reportedBy.required - The person who reported the phone number
 * @property {string} reportedByID.required - The ID of the person who reported the phone number (generated automatically)
 * @property {string} dateReported.required - The date the phone number was reported (generated automatically)
 */

interface PhoneNumber extends mongoose.Document {
  id: string;
  phoneNumber: string;
  type: string;
  reason: string;
  reportedBy: string;
  reportedByID: string;
  dateReported: Date;
}

const phoneNumberSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "Link ID is required"],
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone Number (phoneNumber) is required"],
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

export { PhoneNumber };
export const PhoneNumberModel = mongoose.model<PhoneNumber>("PhoneNumber", phoneNumberSchema);
