import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from './logger.js';

export async function parseDocument(filePath, extension) {
  try {
    if (extension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (extension === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (extension === '.txt') {
      const text = await fs.promises.readFile(filePath, 'utf-8');
      return text;
    } else {
      throw new Error(`Unsupported file extension: ${extension}`);
    }
  } catch (error) {
    logger.error(`Error parsing document at path: ${filePath}`, error);
    throw error;
  }
}
