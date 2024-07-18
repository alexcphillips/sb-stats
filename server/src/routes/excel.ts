import { S3Service } from "../aws";
import xlsx from "xlsx";

export const readFromS3 = async (req, res) => {
  try {
    const { bucket, key } = req.params;
    const excelFileBuffer = await S3Service.downloadFile(bucket, key);
    const workbook = xlsx.read(excelFileBuffer.Body, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    return res.status(200).send(jsonData);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};
