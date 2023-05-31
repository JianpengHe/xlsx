import { createZipFile } from "./createZipFile";
import * as fs from "fs";

const fileList = [
  {
    name: "xl/sharedStrings.xml",
    data: `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="{{sharedStringsCount}}" uniqueCount="{{sharedStringsCount}}">{{sharedStringsList}}</sst>`,
  },
  {
    name: "xl/workbook.xml",
    data: `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x15" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><fileVersion lowestEdited="0" appName="xl"/><bookViews><workbookView/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  },
  {
    name: "xl/worksheets/sheet1.xml",
    data: `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><dimension ref="{{sheetDimension}}"/><sheetData>{{sheetData}}</sheetData></worksheet>`,
  },
  {
    name: "xl/_rels/workbook.xml.rels",
    data: `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`,
  },
  {
    name: "[Content_Types].xml",
    data: `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>`,
  },
  {
    name: "_rels/.rels",
    data: `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  },
];
const numberToArrangeId = (value: number) => {
  value++;
  let o = "";
  do {
    value |= 0;
    const n = (value + 25) % 26;
    o = (n + 10).toString(36) + o;
    value /= 26;
  } while (value > 1);
  return o.toUpperCase();
};

export const arrayToXlsxFile = (data: (number | string)[][]) => {
  /** 行 */
  let rowCount = data.length;
  /** 列 */
  let arrangeCount = Math.max(...data.map(row => row.length));
  const sharedStringsMap: Map<string, number> = new Map();
  const sheetDimension = `A1:${numberToArrangeId(arrangeCount - 1)}${rowCount}`;
  const sheetData = data
    .map(
      (rows, x) =>
        `<row r="${x + 1}" spans="1:${arrangeCount}">${rows
          .map((value, y) =>
            typeof value === "number"
              ? `<c r="${numberToArrangeId(y)}${x + 1}"><v>${value}</v></c>`
              : `<c r="${numberToArrangeId(y)}${x + 1}" t="s"><v>${
                  sharedStringsMap.get(value) ?? sharedStringsMap.set(value, sharedStringsMap.size).get(value)
                }</v></c>`
          )
          .join("")}</row>`
    )
    .join("");
  const sharedStringsCount = String(sharedStringsMap.size);
  const sharedStringsList = [...sharedStringsMap.keys()].map(value => `<si><t>${value}</t></si>`).join("");
  const newFileList = [...fileList];

  for (const obj of newFileList) {
    switch (obj.name) {
      case "xl/sharedStrings.xml":
        obj.data = obj.data
          .replace(/\{\{sharedStringsCount\}\}/g, sharedStringsCount)
          .replace("{{sharedStringsList}}", sharedStringsList);
        break;
      case "xl/worksheets/sheet1.xml":
        obj.data = obj.data.replace("{{sheetDimension}}", sheetDimension).replace("{{sheetData}}", sheetData);
        break;
    }
    // obj.data = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` + obj.data;
  }
  return createZipFile(newFileList);
};

/** 测试用例 */
// const f = fs.createWriteStream("2.xlsx");
// const bufs = arrayToXlsxFile([
//   [3, 54, "sgr", "dsf"],
//   [3456, "jsidf"],
// ]);
// const bufs = createZipFile(
//   fileList.map(({ name, data }) => ({ name, data: data ? fs.readFileSync("../xlsx文件样本/普通样本/" + name) : "" }))
// );

// for (const c of bufs) {
//   f.write(c);
// }
// setTimeout(() => f.end(), 1000);
