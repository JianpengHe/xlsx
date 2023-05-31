// import * as fs from "fs";
// import { Mysql } from "../../tools/dist/node/Mysql";
import { arrayToXlsxFile } from "./arrayToXlsxFile";

export const objectToXlsxFile = (objs: object[], keySort: (keys: string[]) => string[] = keys => keys.sort()) => {
  const keys = keySort([...new Set(objs.map(row => Object.keys(row)).flat())]);
  const xlsxData: (string | number | undefined)[][] = [keys];
  for (const row of objs) {
    xlsxData.push(keys.map(key => row[key]));
  }
  return arrayToXlsxFile(xlsxData);
};

// /** 测试用例 */
// const f = fs.createWriteStream("3.xlsx");
// const bufs = objectToXlsxFile([
//   { name: "张三", age: 14 },
//   { name: "李四", no: 4 },
// ]);

// for (const c of bufs) {
//   f.write(c);
// }
// setTimeout(() => f.end(), 1000);

/** 测试用例2 */
// const mysql = new Mysql({
//   host: "xxx",
//   port: 3306,
//   user: "xxx",
//   password: "xxx",
//   database: "xxx",
//   convertToTimestamp: true,
// });

// mysql.query(`SELECT * FROM xxx`, []).then(objs => {
//   const f = fs.createWriteStream("3.xlsx");
//   const bufs = objectToXlsxFile(objs as any, a => a);

//   for (const c of bufs) {
//     f.write(c);
//   }
//   setTimeout(() => {
//     f.end();
//     process.exit();
//   }, 1000);
// });
