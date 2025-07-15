

import * as XLSX from 'xlsx';

/**
 * Exports an array of objects to an XLSX file.
 * @param data The array of data to export.
 * @param fileName The name of the file to be downloaded (e.g., 'report.xlsx').
 * @param sheetName The name of the worksheet within the XLSX file.
 * @returns {boolean} True if export was successful, false if no data was provided.
 */
export const exportToXLSX = (data: any[], fileName: string, sheetName: string): boolean => {
  if (data.length === 0) {
    return false;
  }
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert the array of objects to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate the XLSX file and trigger the download
  XLSX.writeFile(workbook, fileName);
  return true;
};

/**
 * Exports an array of objects to a CSV file.
 * @param data The array of data to export.
 * @param fileName The name of the file to be downloaded (e.g., 'report.csv').
 * @returns {boolean} True if export was successful, false if no data was provided.
 */
export const exportToCSV = (data: any[], fileName: string): boolean => {
  if (data.length === 0) {
    return false;
  }
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
  
  XLSX.writeFile(workbook, fileName, { bookType: "csv" });
  return true;
};

/**
 * Calculates the age based on a date of birth string.
 * @param dobString The date of birth in 'YYYY-MM-DD' format.
 * @returns The calculated age in years.
 */
export const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};