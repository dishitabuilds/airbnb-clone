'use client';

import { useId, useState } from 'react';

import { ChevronLeftSmall, ChevronRightTiny, ClearDates } from '@/components/icons';
import type { Stay } from '@/lib/types';

import styles from './Calendar.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Column headers: the initial is shown, the full name is announced. */
const WEEKDAYS = [
  { initial: 'S', name: 'Sunday' },
  { initial: 'M', name: 'Monday' },
  { initial: 'T', name: 'Tuesday' },
  { initial: 'W', name: 'Wednesday' },
  { initial: 'T', name: 'Thursday' },
  { initial: 'F', name: 'Friday' },
  { initial: 'S', name: 'Saturday' },
];

/**
 * Nights the reference strikes through in November 2026. Blocked dates are not
 * part of the listing data, so they are transcribed from the capture.
 */
const BLOCKED = new Set([
  '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21',
  '2026-11-22', '2026-11-23', '2026-11-24',
  '2026-11-29', '2026-11-30',
]);

/** `checkInISO` / `checkOutISO` arrive as M/D/YYYY. */
function parseStayDate(value: string): Date {
  const [month, day, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * One month as week rows: leading blanks up to the first weekday, then each day.
 * October 2026 falls on a Thursday and November 2026 on a Sunday — both derived
 * from real dates, never hard-coded.
 */
function weeksOf(year: number, month: number): (number | null)[][] {
  const lead = new Date(year, month, 1).getDay();
  const length = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length }, (_, index) => index + 1),
  ];
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

interface CalendarProps {
  stay: Stay;
  /** Place name in the heading, e.g. "Candolim". */
  location: string;
}

/**
 * A display calendar: it shows the booked range rather than taking a new one.
 * Client-side because the month chevrons page the pair and "Clear dates" drops
 * the highlight — both are real controls, so neither is left inert.
 */
export function Calendar({ stay, location }: CalendarProps) {
  const checkIn = parseStayDate(stay.checkInISO);
  const checkOut = parseStayDate(stay.checkOutISO);

  /** 0 shows the month the stay starts in, plus the one after it. */
  const [offset, setOffset] = useState(0);
  const [rangeShown, setRangeShown] = useState(true);

  const uid = useId();
  const headingId = `${uid}-heading`;

  const lead = new Date(checkIn.getFullYear(), checkIn.getMonth() + offset, 1);
  const months = [0, 1].map(
    (step) => new Date(lead.getFullYear(), lead.getMonth() + step, 1),
  );

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {stay.nights} nights in {location}
      </h2>
      {rangeShown && (
        <div className={styles.subtitle}>
          {stay.checkIn} - {stay.checkOut}
        </div>
      )}

      <div className={styles.months}>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Previous month"
            onClick={() => setOffset((current) => current - 1)}
          >
            <span className={styles.navIcon}>
              <ChevronLeftSmall size={12} />
            </span>
          </button>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Next month"
            onClick={() => setOffset((current) => current + 1)}
          >
            <span className={styles.navIcon}>
              <ChevronRightTiny size={12} />
            </span>
          </button>
        </div>

        {months.map((month) => {
          const year = month.getFullYear();
          const index = month.getMonth();
          const labelId = `${uid}-${year}-${index}`;

          return (
            <div key={labelId}>
              <div id={labelId} className={styles.monthLabel}>
                {MONTH_NAMES[index]} {year}
              </div>

              {/* Wrapper carries the grid role; the caption sits outside it. */}
              <div role="grid" aria-labelledby={labelId}>
                <div role="row" className={styles.weekdays}>
                  {WEEKDAYS.map((weekday, column) => (
                    <span
                      key={column}
                      role="columnheader"
                      aria-label={weekday.name}
                      className={styles.weekday}
                    >
                      {weekday.initial}
                    </span>
                  ))}
                </div>

                <div role="rowgroup" className={styles.days}>
                  {weeksOf(year, index).map((week, row) => (
                    <div key={row} role="row" className={styles.week}>
                      {week.map((day, column) => {
                        if (day === null) {
                          return (
                            <div
                              key={'blank' + column}
                              role="gridcell"
                              aria-hidden="true"
                              className={`${styles.day} ${styles.blank}`}
                            />
                          );
                        }

                        const time = new Date(year, index, day).getTime();
                        const start = rangeShown && time === checkIn.getTime();
                        const finish = rangeShown && time === checkOut.getTime();
                        const between =
                          rangeShown &&
                          time > checkIn.getTime() &&
                          time < checkOut.getTime();
                        const blocked = BLOCKED.has(dateKey(year, index, day));

                        const classes = [styles.day];
                        if (start) classes.push(styles.rangeStart);
                        else if (finish) classes.push(styles.rangeEnd);
                        else if (between) classes.push(styles.rangeMiddle);
                        else if (blocked) classes.push(styles.unavailable);

                        return (
                          <div
                            key={day}
                            role="gridcell"
                            className={classes.join(' ')}
                            aria-label={`${day} ${MONTH_NAMES[index]} ${year}`}
                            aria-selected={start || finish || between ? true : undefined}
                            aria-disabled={blocked ? true : undefined}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.keyboardHint} aria-hidden="true">
          <ClearDates
            width={20}
            height={14}
            style={{ display: 'block', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }}
          />
        </span>
        <button type="button" className={styles.clear} onClick={() => setRangeShown(false)}>
          Clear dates
        </button>
      </div>
    </section>
  );
}
