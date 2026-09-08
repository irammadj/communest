const EMAIL_RE = /^[^\s@]+@(gmail\.com|email\.com)$/i;
const PHONE_RE = /^\+254\d{9}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;
const textLength = (value, min, max) =>
  isNonEmptyString(value) &&
  value.trim().length >= min &&
  value.trim().length <= max;
const validEmail = (value) =>
  typeof value === "string" && EMAIL_RE.test(value.trim());
const validPhone = (value) =>
  typeof value === "string" && PHONE_RE.test(value.trim());
const validPassword = (value) =>
  typeof value === "string" && PASSWORD_RE.test(value);
const positiveInteger = (value) => Number.isInteger(value) && value > 0;
const inRangeInteger = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max;
const required = (body, fields) =>
  fields.find((field) => !isNonEmptyString(body[field]));
const fail = (res, message) => res.status(400).json({ message });

module.exports = {
  isNonEmptyString,
  textLength,
  validEmail,
  validPhone,
  validPassword,
  positiveInteger,
  inRangeInteger,
  required,
  fail,
};
