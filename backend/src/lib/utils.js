import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // add the token as cookie to the response
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS - Cross-Site Scripting attacks (not accessible via JavaScript)
    sameSite: "strict", // CSRF - Cross-Site Request Forgery Attacks
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};
