import ExcelJS from "exceljs";

export async function jsonToExcel(jsonData, outputPath) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("data");

  sheet.addRow(["label", "value"]);

  for (const row of jsonData.rows || []) {
    sheet.addRow([row.label || "", row.value || ""]);
  }

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
}
