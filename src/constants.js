export const DB_NAME = "CautionMoney";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
};

export const collegeGmail = "jiveemourya@gmail.com";
