// utils/csvParser.ts
export interface Course {
  name: string;
  code: string;
  units: number;
  passed: boolean;
}

export interface CourseGroup {
  name: string;
  requiredUnits: number;
  courses: Course[];
  passedUnits: number;
}

export const parseCSV = (csvText: string): CourseGroup[] => {
  // پاکسازی و نرمال‌سازی متن CSV
  const normalizedText = csvText
    .replace(/\r/g, "") // حذف carriage return
    .replace(/"/g, "") // حذف quotation marks
    .trim();

  const lines = normalizedText.split("\n").filter((line) => line.trim() !== "");
  const groups: CourseGroup[] = [];

  if (lines.length === 0) return groups;

  // پردازش خط اول برای دریافت گروه‌ها
  const headerLine = lines[0];
  const headers = headerLine.split(",");

  // شناسایی گروه‌ها از هدر
  for (let i = 0; i < headers.length; i += 3) {
    const groupHeader = headers[i]?.trim();
    if (!groupHeader || groupHeader === "") continue;

    // جدا کردن نام گروه و تعداد واحدهای مورد نیاز
    const dashIndex = groupHeader.indexOf(" - ");
    if (dashIndex === -1) continue;

    const name = groupHeader.substring(0, dashIndex).trim();
    const unitsPart = groupHeader.substring(dashIndex + 3).trim();

    // استخراج عدد از رشته (حتی اگر به فارسی باشد)
    const unitsMatch = unitsPart.match(/[\u06F0-\u06F90-9]+/); // اعداد فارسی و انگلیسی
    const requiredUnits = unitsMatch
      ? parseInt(
          unitsMatch[0].replace(/[\u06F0-\u06F9]/g, (d: string) =>
            String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
          )
        )
      : 0;

    if (name) {
      groups.push({
        name,
        requiredUnits,
        courses: [],
        passedUnits: 0,
      });
    }
  }

  // پردازش خطوط بعدی برای دریافت دروس
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(",");

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const columnIndex = groupIndex * 3;

      if (columnIndex + 2 < columns.length) {
        const name = columns[columnIndex]?.trim();
        const code = columns[columnIndex + 1]?.trim();
        const unitsStr = columns[columnIndex + 2]?.trim();

        if (!name || name === "" || !code || code === "") continue;

        // تبدیل واحد به عدد (حذف کاراکترهای غیر عددی)
        const cleanUnitsStr =
          unitsStr?.replace(/[^\u06F0-\u06F90-9]/g, "") || "0";
        const units = cleanUnitsStr
          ? parseInt(
              cleanUnitsStr.replace(/[\u06F0-\u06F9]/g, (d: string) =>
                String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
              )
            )
          : 0;

        groups[groupIndex].courses.push({
          name,
          code,
          units: isNaN(units) ? 0 : units,
          passed: false,
        });
      }
    }
  }

  return groups.filter((group) => group.courses.length > 0);
};
