import DataUriParser from "datauri/parser.js";
import path from "path";

interface UploadedFile {
  originalname: string;
  buffer: Buffer;
}

const getBuffer = (file: UploadedFile) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname);
  return parser.format(extName, file.buffer);
};

export default getBuffer;
