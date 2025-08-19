// utils/transcriptParser.ts
export const parseTranscriptHTML = (htmlText: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const passedCourses: string[] = [];

  // یافتن تمامی جداول مربوط به ترم‌ها
  const termTables = doc.querySelectorAll('div[id^="tab"] table');

  termTables.forEach((table) => {
    const rows = table.querySelectorAll("tr");

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 5) {
        const codeCell = cells[0];
        const statusCell = cells[4];

        if (
          codeCell &&
          statusCell &&
          statusCell.textContent?.includes("قبول")
        ) {
          const code = codeCell.textContent?.trim();
          if (code) {
            passedCourses.push(code);
          }
        }
      }
    });
  });

  return passedCourses;
};
