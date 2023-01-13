import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";

import { PhoneNumberModel } from "../../database/models/PhoneNumber.schema";

/**
 * Checks various APIs to see if a phone number is a scam
 * @param {string} phoneNumber The phone number to check
 */
export async function checkPhoneNumber(phoneNumber: string) {

  const phoneNumberExistsInDatabase = await PhoneNumberModel.exists({
    phoneNumber: phoneNumber,
  });

  if (phoneNumberExistsInDatabase) {
    return {
      isScam: true,
      phoneNumber: phoneNumber,
      localDbNative: true,
      reason: "Link exists in native database!",
    };
  }

  return {
    isScam: false,
    phoneNumber: phoneNumber,
    localDbNative: false,
  };
}
