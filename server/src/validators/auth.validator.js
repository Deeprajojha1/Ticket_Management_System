import { body } from "express-validator";
const passwordRule = body("password")
  .isString()
  .withMessage("Password is required")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Z]/)
  .withMessage("Password must contain an uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must contain a lowercase letter")
  .matches(/\d/)
  .withMessage("Password must contain a number")
  .matches(/[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/)
  .withMessage("Password must contain a special character");

export const registerValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Full name must be between 2 and 80 characters"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  passwordRule,
  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone("any")
    .withMessage("Phone must be a valid mobile number"),
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
