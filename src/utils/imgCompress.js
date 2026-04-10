import sharp from "sharp";
import logger from "./logger.js";

export const imgCompress = async (inputBuffer, mimeType, opts = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    preferWebp = false,
  } = opts;

  try {
    const pipeline = sharp(inputBuffer, { failOnError: false });
    const meta = await pipeline.metadata().catch(() => ({}));
    const detectedFormat = (meta.format || "").toLowerCase();

    logger.info(
      `imgCompress - inputSize=${inputBuffer.length}B, mimeType=${mimeType}, detectedFormat=${detectedFormat}, pages=${meta.pages || 1}`
    );

    if (
      (meta.width && meta.width > maxWidth) ||
      (meta.height && meta.height > maxHeight)
    ) {
      pipeline.resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Decide output based on detectedFormat + preferWebp
    // If preferWebp true and input is png/jpeg -> convert to webp
    if (
      preferWebp &&
      (detectedFormat === "png" ||
        detectedFormat === "jpeg" ||
        detectedFormat === "jpg")
    ) {
      const buffer = await pipeline.webp({ quality }).toBuffer();
      return { buffer, mimeType: "image/webp" };
    }

    // If input already webp -> keep webp
    if (detectedFormat === "webp") {
      const buffer = await pipeline.webp({ quality }).toBuffer();
      return { buffer, mimeType: "image/webp" };
    }

    // If input jpeg -> jpeg output
    if (detectedFormat === "jpeg" || detectedFormat === "jpg") {
      const buffer = await pipeline.jpeg({ quality }).toBuffer();
      return { buffer, mimeType: "image/jpeg" };
    }

    // If input png -> png output
    if (detectedFormat === "png") {
      const buffer = await pipeline.png().toBuffer();
      return { buffer, mimeType: "image/png" };
    }

    const fallbackBuf = await pipeline.toBuffer();
    return {
      buffer: fallbackBuf,
      mimeType: mimeType || `image/${detectedFormat || "unknown"}`,
    };
  } catch (err) {
    logger.warn(
      `imgCompress - compression failed (${err.message}), returning original buffer`
    );
    return {
      buffer: inputBuffer,
      mimeType: mimeType || "application/octet-stream",
    };
  }
};
