// utils/transcriptParser.ts
export interface TranscriptCourse {
  code: string;
  name: string;
}

export const parseTranscriptHTML = (htmlText: string): TranscriptCourse[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const passedCourses: TranscriptCourse[] = [];

  // یافتن تمامی جداول مربوط به ترم‌ها
  const termTables = doc.querySelectorAll('div[id^="tab"] table');

  termTables.forEach((table) => {
    const rows = table.querySelectorAll("tr");

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 5) {
        const codeCell = cells[0];
        const nameCell = cells[1];
        const statusCell = cells[4];

        if (
          codeCell &&
          nameCell &&
          statusCell &&
          statusCell.textContent?.includes("قبول")
        ) {
          const code = codeCell.textContent?.trim() || "-";
          const name = nameCell.textContent?.trim() || "نامعلوم";

          passedCourses.push({ code, name });
        }
      }
    });
  });

  return passedCourses;
};
