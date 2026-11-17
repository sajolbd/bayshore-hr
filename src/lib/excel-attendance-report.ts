import {
  DEFAULT_OFFICE_IN_TIME,
  DEFAULT_OFFICE_OUT_TIME,
  evaluateClockInLate,
  formatMinutesAsDuration,
  formatTime12h,
  normalizeTime24h,
  parseDurationToMinutes,
} from "./office-time";

export interface MonthlyReportEmployeeInfo {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  location?: string;
  officeInTime?: string;
  officeOutTime?: string;
}

export interface MonthlyReportAttendanceInput {
  dateKey: string; // "2026-11-15"
  dayLabel?: string; // "Sun"
  checkIn: string | null;
  checkOut: string | null;
  workHours: string;
  status: string;
  location?: string;
  scheduledInTime?: string;
  scheduledOutTime?: string;
}

export interface MonthlyAttendanceEvaluatedRow {
  dateKey: string;
  dayLabel: string;
  scheduledIn12h: string;
  scheduledOut12h: string;
  checkInDisplay: string;
  checkOutDisplay: string;
  isLate: boolean;
  lateMinutes: number;
  lateLabel: string;
  workHours: string;
  effectiveStatus: string;
  location: string;
}

export interface MonthlyAttendanceReportData {
  employee: MonthlyReportEmployeeInfo;
  monthKey: string; // "2026-11"
  monthLabel: string; // "November 2026"
  officeIn24h: string;
  officeOut24h: string;
  officeIn12h: string;
  officeOut12h: string;
  rows: MonthlyAttendanceEvaluatedRow[];
  summary: {
    totalLoggedDays: number;
    presentDays: number;
    onTimeDays: number;
    lateDays: number;
    leaveDays: number;
    totalLateMinutes: number;
    totalLateFormatted: string;
    totalWorkMinutes: number;
    totalWorkFormatted: string;
  };
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatMonthLabel(monthKey: string): string {
  const match = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (!match) return monthKey;
  const year = match[1];
  const monthIdx = parseInt(match[2], 10) - 1;
  const monthName = MONTH_NAMES[monthIdx] || match[2];
  return `${monthName} ${year}`;
}

export function getDayNameFromDateKey(dateKey: string): string {
  const parts = dateKey.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return "";
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(d);
}

/**
 * Builds structured monthly attendance report data for a single employee,
 * flagging any check-in after the employee's configured officeInTime as Late.
 */
export function buildMonthlyAttendanceReport(
  employee: MonthlyReportEmployeeInfo,
  monthKey: string,
  records: MonthlyReportAttendanceInput[]
): MonthlyAttendanceReportData {
  const officeIn24h = normalizeTime24h(
    employee.officeInTime,
    DEFAULT_OFFICE_IN_TIME
  );
  const officeOut24h = normalizeTime24h(
    employee.officeOutTime,
    DEFAULT_OFFICE_OUT_TIME
  );
  const officeIn12h = formatTime12h(officeIn24h, "09:00 AM");
  const officeOut12h = formatTime12h(officeOut24h, "06:00 PM");

  // Filter records matching the selected monthKey ("YYYY-MM")
  const monthRecords = records
    .filter((r) => r.dateKey && r.dateKey.startsWith(monthKey))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  let presentDays = 0;
  let onTimeDays = 0;
  let lateDays = 0;
  let leaveDays = 0;
  let totalLateMinutes = 0;
  let totalWorkMinutes = 0;

  const evaluatedRows: MonthlyAttendanceEvaluatedRow[] = monthRecords.map(
    (rec) => {
      const rowOfficeIn = rec.scheduledInTime || officeIn24h;
      const rowOfficeOut = rec.scheduledOutTime || officeOut24h;
      const scheduledIn12h = formatTime12h(rowOfficeIn, officeIn12h);
      const scheduledOut12h = formatTime12h(rowOfficeOut, officeOut12h);

      const isLeave = rec.status === "On Leave" || rec.status === "Absent";
      const lateEval = isLeave
        ? {
            isLate: false,
            lateMinutes: 0,
            lateLabel: rec.status,
            officeIn24h: rowOfficeIn,
            officeIn12h: scheduledIn12h,
            checkIn12h: rec.checkIn || "--:--",
          }
        : evaluateClockInLate(rec.checkIn, rowOfficeIn);

      // Determine lateness based strictly on assigned office in-time when check-in exists,
      // or explicit Late status if check-in timestamp could not be parsed.
      const isLate = !isLeave && (lateEval.isLate || (!rec.checkIn && rec.status === "Late"));
      const effectiveStatus = isLeave
        ? rec.status
        : isLate
        ? "Late"
        : "Present";

      if (isLeave) {
        leaveDays += 1;
      } else {
        presentDays += 1;
        totalWorkMinutes += parseDurationToMinutes(rec.workHours);
        if (isLate) {
          lateDays += 1;
          totalLateMinutes += lateEval.lateMinutes;
        } else {
          onTimeDays += 1;
        }
      }

      return {
        dateKey: rec.dateKey,
        dayLabel: rec.dayLabel || getDayNameFromDateKey(rec.dateKey),
        scheduledIn12h,
        scheduledOut12h,
        checkInDisplay: rec.checkIn ? lateEval.checkIn12h : "--:--",
        checkOutDisplay: isLeave
          ? "--"
          : rec.checkOut || "In Progress",
        isLate,
        lateMinutes: lateEval.lateMinutes,
        lateLabel: isLate
          ? lateEval.lateMinutes > 0
            ? lateEval.lateLabel
            : `After ${scheduledIn12h}`
          : isLeave
          ? rec.status
          : "On Time",
        workHours: rec.workHours || "--",
        effectiveStatus,
        location: rec.location || employee.location || "Gulshan HQ",
      };
    }
  );

  return {
    employee,
    monthKey,
    monthLabel: formatMonthLabel(monthKey),
    officeIn24h,
    officeOut24h,
    officeIn12h,
    officeOut12h,
    rows: evaluatedRows,
    summary: {
      totalLoggedDays: evaluatedRows.length,
      presentDays,
      onTimeDays,
      lateDays,
      leaveDays,
      totalLateMinutes,
      totalLateFormatted:
        totalLateMinutes > 0 ? formatMinutesAsDuration(totalLateMinutes) : "0m",
      totalWorkMinutes,
      totalWorkFormatted:
        totalWorkMinutes > 0 ? formatMinutesAsDuration(totalWorkMinutes) : "0m",
    },
  };
}

// ============================================================================
// Pure OpenXML (.xlsx) Builder with Red-Marked Late Clock-In Styling
// ============================================================================

function escapeXml(val: string | number | null | undefined): string {
  const s = String(val ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function colIndexToLetter(colIdx0: number): string {
  let n = colIdx0 + 1;
  let str = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    str = String.fromCharCode(65 + rem) + str;
    n = Math.floor((n - 1) / 26);
  }
  return str;
}

interface XlsxCell {
  value: string | number;
  styleIndex?: number;
}

function buildSheetXml(
  rows: XlsxCell[][],
  colWidths: number[],
  rowHeights?: Record<number, number>,
  merges: string[] = []
): string {
  const colsXml = colWidths
    .map(
      (w, idx) =>
        `<col min="${idx + 1}" max="${idx + 1}" width="${w}" customWidth="1"/>`
    )
    .join("");

  const rowsXml = rows
    .map((cells, rIdx) => {
      const rowNum = rIdx + 1;
      const height = rowHeights?.[rowNum];
      const htAttr = height ? ` ht="${height}" customHeight="1"` : "";
      if (cells.length === 0) {
        return `<row r="${rowNum}"${htAttr}/>`;
      }
      const cellsXml = cells
        .map((cell, cIdx) => {
          const ref = `${colIndexToLetter(cIdx)}${rowNum}`;
          const styleAttr =
            cell.styleIndex !== undefined ? ` s="${cell.styleIndex}"` : "";
          if (typeof cell.value === "number" && Number.isFinite(cell.value)) {
            return `<c r="${ref}"${styleAttr}><v>${cell.value}</v></c>`;
          }
          return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t>${escapeXml(
            cell.value
          )}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowNum}"${htAttr}>${cellsXml}</row>`;
    })
    .join("");

  const mergeCellsXml =
    merges.length > 0
      ? `<mergeCells count="${merges.length}">${merges
          .map((ref) => `<mergeCell ref="${ref}"/>`)
          .join("")}</mergeCells>`
      : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
  ${mergeCellsXml}
</worksheet>`;
}

/**
 * Styles index map in xl/styles.xml:
 * 0 = Default
 * 1 = Report Title Banner (Bold 13pt White on Dark Slate #0F172A)
 * 2 = Subtitle / Meta Info (Bold 10pt Orange #C2410C on Warm Tint #FFF7ED)
 * 3 = Meta Label (Bold 10pt Slate #334155 on #F8FAFC with border)
 * 4 = Meta Value (10pt #0F172A on #FFFFFF with border)
 * 5 = Table Header (Bold 10pt White on #1E293B with border)
 * 6 = Normal Data Cell (10pt #1E293B on #FFFFFF with border)
 * 7 = LATE CLOCK-IN RED MARK CELL (Bold 10pt Bright Red #DC2626 on Light Red Fill #FEE2E2 with Red Border!)
 * 8 = ON-TIME CLOCK-IN GREEN CELL (Bold 10pt Emerald #15803D on Light Green Fill #DCFCE7 with Border)
 * 9 = LEAVE / ABSENT AMBER CELL (Bold 10pt Amber #B45309 on Light Amber Fill #FEF3C7 with Border)
 */
function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="7">
    <font><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFC2410C"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF334155"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFDC2626"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF15803D"/><name val="Calibri"/></font>
  </fonts>
  <fills count="9">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF7ED"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E293B"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="medium"><color rgb="FFDC2626"/></left>
      <right style="medium"><color rgb="FFDC2626"/></right>
      <top style="thin"><color rgb="FFDC2626"/></top>
      <bottom style="thin"><color rgb="FFDC2626"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="10">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center" horizontal="left"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="5" fillId="6" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="6" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;
}

// CRC32 implementation for ZIP packaging
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16LE(buf: Uint8Array, offset: number, val: number) {
  buf[offset] = val & 0xff;
  buf[offset + 1] = (val >>> 8) & 0xff;
}

function writeUint32LE(buf: Uint8Array, offset: number, val: number) {
  buf[offset] = val & 0xff;
  buf[offset + 1] = (val >>> 8) & 0xff;
  buf[offset + 2] = (val >>> 16) & 0xff;
  buf[offset + 3] = (val >>> 24) & 0xff;
}

function createZipArchive(
  files: { name: string; content: string }[]
): Uint8Array {
  const encoder = new TextEncoder();
  const entries = files.map((f) => {
    const nameBytes = encoder.encode(f.name);
    const dataBytes = encoder.encode(f.content);
    const crc = crc32(dataBytes);
    return { nameBytes, dataBytes, crc, offset: 0 };
  });

  let localSize = 0;
  for (const e of entries) {
    e.offset = localSize;
    localSize += 30 + e.nameBytes.length + e.dataBytes.length;
  }

  let centralSize = 0;
  for (const e of entries) {
    centralSize += 46 + e.nameBytes.length;
  }

  const totalSize = localSize + centralSize + 22;
  const out = new Uint8Array(totalSize);
  let pos = 0;

  // Local file headers + file data
  for (const e of entries) {
    writeUint32LE(out, pos, 0x04034b50); // Local file header signature
    writeUint16LE(out, pos + 4, 20); // Version needed to extract (2.0)
    writeUint16LE(out, pos + 6, 0x0800); // General purpose bit flag (UTF-8)
    writeUint16LE(out, pos + 8, 0); // Compression method (0 = Store)
    writeUint16LE(out, pos + 10, 0); // Last mod file time
    writeUint16LE(out, pos + 12, 0x5421); // Last mod file date
    writeUint32LE(out, pos + 14, e.crc); // CRC-32
    writeUint32LE(out, pos + 18, e.dataBytes.length); // Compressed size
    writeUint32LE(out, pos + 22, e.dataBytes.length); // Uncompressed size
    writeUint16LE(out, pos + 26, e.nameBytes.length); // File name length
    writeUint16LE(out, pos + 28, 0); // Extra field length
    pos += 30;
    out.set(e.nameBytes, pos);
    pos += e.nameBytes.length;
    out.set(e.dataBytes, pos);
    pos += e.dataBytes.length;
  }

  const centralDirOffset = pos;

  // Central directory headers
  for (const e of entries) {
    writeUint32LE(out, pos, 0x02014b50); // Central directory signature
    writeUint16LE(out, pos + 4, 20); // Version made by
    writeUint16LE(out, pos + 6, 20); // Version needed to extract
    writeUint16LE(out, pos + 8, 0x0800); // UTF-8 flag
    writeUint16LE(out, pos + 10, 0); // Compression method (Store)
    writeUint16LE(out, pos + 12, 0); // File time
    writeUint16LE(out, pos + 14, 0x5421); // File date
    writeUint32LE(out, pos + 16, e.crc); // CRC-32
    writeUint32LE(out, pos + 20, e.dataBytes.length); // Compressed size
    writeUint32LE(out, pos + 24, e.dataBytes.length); // Uncompressed size
    writeUint16LE(out, pos + 28, e.nameBytes.length); // File name length
    writeUint16LE(out, pos + 30, 0); // Extra field length
    writeUint16LE(out, pos + 32, 0); // File comment length
    writeUint16LE(out, pos + 34, 0); // Disk number start
    writeUint16LE(out, pos + 36, 0); // Internal file attributes
    writeUint32LE(out, pos + 38, 0); // External file attributes
    writeUint32LE(out, pos + 42, e.offset); // Relative offset of local header
    pos += 46;
    out.set(e.nameBytes, pos);
    pos += e.nameBytes.length;
  }

  // End of Central Directory Record (EOCD)
  writeUint32LE(out, pos, 0x06054b50);
  writeUint16LE(out, pos + 4, 0);
  writeUint16LE(out, pos + 6, 0);
  writeUint16LE(out, pos + 8, entries.length);
  writeUint16LE(out, pos + 10, entries.length);
  writeUint32LE(out, pos + 12, centralSize);
  writeUint32LE(out, pos + 16, centralDirOffset);
  writeUint16LE(out, pos + 20, 0);

  return out;
}

/**
 * Generates a real OpenXML .xlsx binary buffer for an individual employee's
 * monthly attendance report. Any clock-in after the employee's assigned
 * officeInTime is highlighted in RED (Style 7: Red fill #FEE2E2 + Bold Red text #DC2626).
 */
export function generateEmployeeMonthlyAttendanceXlsx(
  report: MonthlyAttendanceReportData
): Uint8Array {
  const { employee, monthLabel, officeIn12h, officeOut12h, rows, summary } =
    report;

  const sheetRows: XlsxCell[][] = [
    // Row 1: Title Banner
    [
      {
        value: `BAYSHORE HR — INDIVIDUAL MONTHLY ATTENDANCE REPORT (${monthLabel.toUpperCase()})`,
        styleIndex: 1,
      },
      { value: "", styleIndex: 1 },
      { value: "", styleIndex: 1 },
      { value: "", styleIndex: 1 },
      { value: "", styleIndex: 1 },
      { value: "", styleIndex: 1 },
      { value: "", styleIndex: 1 },
      { value: "", styleIndex: 1 },
      { value: "", styleIndex: 1 },
      { value: "", styleIndex: 1 },
    ],
    // Row 2: Rule Notice Banner
    [
      {
        value: `Assigned Office Time: ${officeIn12h} - ${officeOut12h} | Rule: Clock-In after ${officeIn12h} is marked in RED as Late Arrival`,
        styleIndex: 2,
      },
      { value: "", styleIndex: 2 },
      { value: "", styleIndex: 2 },
      { value: "", styleIndex: 2 },
      { value: "", styleIndex: 2 },
      { value: "", styleIndex: 2 },
      { value: "", styleIndex: 2 },
      { value: "", styleIndex: 2 },
      { value: "", styleIndex: 2 },
      { value: "", styleIndex: 2 },
    ],
    // Row 3: Employee Details Row 1
    [
      { value: "Employee Name", styleIndex: 3 },
      { value: employee.name, styleIndex: 4 },
      { value: "Employee ID", styleIndex: 3 },
      { value: employee.id, styleIndex: 4 },
      { value: "Department", styleIndex: 3 },
      { value: employee.department, styleIndex: 4 },
      { value: "Designation", styleIndex: 3 },
      { value: employee.role, styleIndex: 4 },
      { value: "Report Month", styleIndex: 3 },
      { value: monthLabel, styleIndex: 4 },
    ],
    // Row 4: Employee Shift & Summary KPIs
    [
      { value: "Office In Time", styleIndex: 3 },
      { value: officeIn12h, styleIndex: 4 },
      { value: "Office Out Time", styleIndex: 3 },
      { value: officeOut12h, styleIndex: 4 },
      { value: "Present Days", styleIndex: 3 },
      { value: summary.presentDays, styleIndex: 8 },
      { value: "On-Time Days", styleIndex: 3 },
      { value: summary.onTimeDays, styleIndex: 8 },
      { value: "Late Clock-Ins (Red)", styleIndex: 3 },
      {
        value: summary.lateDays,
        styleIndex: summary.lateDays > 0 ? 7 : 8,
      },
    ],
    // Row 5: Blank spacer
    [],
    // Row 6: Table Header
    [
      { value: "Date", styleIndex: 5 },
      { value: "Day", styleIndex: 5 },
      { value: "Assigned In Time", styleIndex: 5 },
      { value: "Assigned Out Time", styleIndex: 5 },
      { value: "Actual Clock-In Time", styleIndex: 5 },
      { value: "Actual Clock-Out Time", styleIndex: 5 },
      { value: "Late / Punctuality", styleIndex: 5 },
      { value: "Work Hours", styleIndex: 5 },
      { value: "Attendance Status", styleIndex: 5 },
      { value: "Office Location", styleIndex: 5 },
    ],
  ];

  if (rows.length === 0) {
    sheetRows.push([
      { value: report.monthKey, styleIndex: 6 },
      { value: "-", styleIndex: 6 },
      { value: officeIn12h, styleIndex: 6 },
      { value: officeOut12h, styleIndex: 6 },
      { value: "No attendance punches recorded for this month", styleIndex: 6 },
      { value: "-", styleIndex: 6 },
      { value: "-", styleIndex: 6 },
      { value: "-", styleIndex: 6 },
      { value: "-", styleIndex: 6 },
      { value: employee.location || "Gulshan HQ", styleIndex: 6 },
    ]);
  } else {
    for (const r of rows) {
      const isLeave =
        r.effectiveStatus === "On Leave" || r.effectiveStatus === "Absent";
      const clockInStyle = isLeave ? 9 : r.isLate ? 7 : 8;
      const clockInText = isLeave
        ? "On Leave"
        : r.isLate
        ? `${r.checkInDisplay} (LATE)`
        : r.checkInDisplay;

      const punctualityStyle = isLeave ? 9 : r.isLate ? 7 : 8;
      const statusStyle = isLeave ? 9 : r.isLate ? 7 : 8;

      sheetRows.push([
        { value: r.dateKey, styleIndex: 6 },
        { value: r.dayLabel, styleIndex: 6 },
        { value: r.scheduledIn12h, styleIndex: 6 },
        { value: r.scheduledOut12h, styleIndex: 6 },
        { value: clockInText, styleIndex: clockInStyle },
        { value: r.checkOutDisplay, styleIndex: 6 },
        { value: r.lateLabel, styleIndex: punctualityStyle },
        { value: r.workHours, styleIndex: 6 },
        {
          value: r.isLate ? `Late (After ${r.scheduledIn12h})` : r.effectiveStatus,
          styleIndex: statusStyle,
        },
        { value: r.location, styleIndex: 6 },
      ]);
    }

    // Monthly Summary Footer Row
    sheetRows.push([
      { value: "TOTAL / SUMMARY", styleIndex: 3 },
      { value: `${summary.totalLoggedDays}d`, styleIndex: 3 },
      { value: officeIn12h, styleIndex: 3 },
      { value: officeOut12h, styleIndex: 3 },
      {
        value: `${summary.lateDays} Late / ${summary.onTimeDays} On-Time`,
        styleIndex: summary.lateDays > 0 ? 7 : 8,
      },
      { value: "-", styleIndex: 3 },
      {
        value: `Total Late: ${summary.totalLateFormatted}`,
        styleIndex: summary.lateDays > 0 ? 7 : 8,
      },
      { value: summary.totalWorkFormatted, styleIndex: 3 },
      { value: `Leave: ${summary.leaveDays}d`, styleIndex: 3 },
      { value: employee.location || "Gulshan HQ", styleIndex: 3 },
    ]);
  }

  const colWidths = [16, 10, 18, 18, 28, 20, 22, 16, 26, 24];
  const rowHeights: Record<number, number> = {
    1: 26,
    2: 20,
    3: 20,
    4: 20,
    6: 22,
  };

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Monthly Attendance" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = buildStylesXml();
  const sheetXml = buildSheetXml(sheetRows, colWidths, rowHeights, [
    "A1:J1",
    "A2:J2",
  ]);

  return createZipArchive([
    { name: "[Content_Types].xml", content: contentTypesXml },
    { name: "_rels/.rels", content: rootRelsXml },
    { name: "xl/workbook.xml", content: workbookXml },
    { name: "xl/_rels/workbook.xml.rels", content: workbookRelsXml },
    { name: "xl/styles.xml", content: stylesXml },
    { name: "xl/worksheets/sheet1.xml", content: sheetXml },
  ]);
}

/**
 * Helper to trigger browser download of the generated .xlsx file.
 */
export function downloadMonthlyAttendanceXlsxInBrowser(
  report: MonthlyAttendanceReportData
): void {
  const bytes = generateEmployeeMonthlyAttendanceXlsx(report);
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const safeName = report.employee.name
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
  const filename = `Attendance_${report.employee.id}_${safeName}_${report.monthKey}.xlsx`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
