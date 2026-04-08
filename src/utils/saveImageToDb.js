import Image from "../models/imageModel.js";
import ServerError from "../errors/ServerError.js";
import logger from "./logger.js";
import { imgCompress } from "./imgCompress.js";

export const saveImageToDb = async (buffer, originalName, mimeType) => {
  try {
    logger.info(`saveImageToDb - called for ${originalName}`);

    let finalBuffer = buffer;
    let finalMime = mimeType;

    try {
      const compressed = await imgCompress(buffer, mimeType, {
        maxWidth: 1600,
        maxHeight: 1200,
        quality: 75,
        preferWebp: false,
      });
      finalBuffer = compressed.buffer;
      finalMime = compressed.mimeType || mimeType;
      logger.info(
        `saveImageToDb - using compressed image (mime: ${finalMime}) for ${originalName}`
      );
    } catch (compressErr) {
      logger.warn(
        `saveImageToDb - compression failed (${compressErr.message}), using original buffer`
      );
    }

    const imageDoc = await Image.create({
      fileName: originalName,
      mimeType: finalMime,
      data: finalBuffer,
    });

    logger.info(`saveImageToDb - saved image id: ${imageDoc._id}`);
    return imageDoc._id;
  } catch (err) {
    logger.error(`saveImageToDb - ${err.message}`);
    throw new ServerError(500, "Failed to save image");
  }
};
