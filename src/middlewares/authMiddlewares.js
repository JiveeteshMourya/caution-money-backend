import ServerError from "../common/errors/ServerError.js";
import wrapAsync from "../common/utils/wrapAsync.js";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import logger from "../common/utils/logger.js";
import { authMiddlewaresText } from "../responseTexts.js";

export const verifyAccessJWT = wrapAsync(async (req, _, next) => {
  logger.http(
    `verifyAccessJWT called - cookies: ${JSON.stringify(req.cookies)}`
  );
  // logger.http("verifyAccessJWT called");
  // console.log("req.cookies:", req.cookies);

  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    logger.warn("verifyAccessJWT - no token provided");
    throw new ServerError(401, authMiddlewaresText.verifyAccessJWT.unauth);
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const admin = await Admin.findById(decodedToken?._id); // this _id is obtained because we sent the admin._id in generateAccessToken()
  if (!admin) {
    logger.error(
      `verifyAccessJWT - admin not found for id - ${decodedToken._id}`
    );
    throw new ServerError(
      401,
      authMiddlewaresText.verifyAccessJWT.invalidToken
    );
  }

  // if (!admin.isUserVerified) {
  //   logger.error(`verifyAccessJWT - not a verified admin - ${admin._id}`);
  //   throw new ServerError(401, authMiddlewaresText.verifyAccessJWT.notVerified);
  // }

  if (admin.isBlocked) {
    logger.error(`verifyAccessJWT - Admin id blocked, access denied`);
    throw new ServerError(401, authMiddlewaresText.verifyAccessJWT.idBlocked);
  }

  logger.info(
    `verifyAccessJWT - admin ${admin._id} authenticated for resources`
  );
  req.admin = admin;
  next();
});
