/**
 * Slots Utils : Génération et manipulation des créneaux 1h30
 * 
 * Source de vérité : créneaux FIXES de 90 minutes
 * Format unifié : ISO strings en timezone locale (Europe/Paris)
 */

// =====================================================
// CONSTANTES
// =====================================================

export const SLOT_DURATION_MINUTES = 90;
export const DEFAULT_OPENING_HOUR = 9;   // 09:00
export const DEFAULT_CLOSING_HOUR = 23;  // 23:00 (dernier slot commence à 21:30)
export const TIMEZONE = 'Europe/Paris';

// =====================================================
// TYPES
// =====================================================

export type TimeSlot = {
  slot_id: string;
  start_at: string;  // ISO string (2026-01-30T09:00:00.000+01:00)
  end_at: string;    // ISO string (2026-01-30T10:30:00.000+01:00)
  label: string;     // "09:00 - 10:30"
};

export type AvailabilitySlot = TimeSlot & {
  status: 'free' | 'reserved';
  booking_id?: string;
  created_by?: string;
};

// =====================================================
// HELPERS
// =====================================================

/**
 * Pad number with leading zero
 */
function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Convert Date to ISO string with local offset
 * Ex: 2026-01-30T09:00:00.000+01:00
 */
export function toISOWithOffset(date: Date): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hour = pad2(date.getHours());
  const minute = pad2(date.getMinutes());
  const second = pad2(date.getSeconds());
  
  const offsetMinutes = -date.getTimezoneOffset();
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const offsetHours = pad2(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetMins = pad2(Math.abs(offsetMinutes) % 60);
  
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000${offsetSign}${offsetHours}:${offsetMins}`;
}

/**
 * Build unique slot ID (SINGLE SOURCE OF TRUTH)
 * Format: {clubId}_{courtId}_{startISO}_{endISO}
 */
export function buildSlotId(
  clubId: string,
  courtId: string,
  startISO: string,
  endISO: string
): string {
  return `${clubId}_${courtId}_${startISO}_${endISO}`;
}

/**
 * Parse slot ID back to components
 */
export function parseSlotId(slotId: string): {
  clubId: string;
  courtId: string;
  startISO: string;
  endISO: string;
} | null {
  const parts = slotId.split('_');
  if (parts.length !== 4) return null;
  
  return {
    clubId: parts[0],
    courtId: parts[1],
    startISO: parts[2],
    endISO: parts[3],
  };
}

// =====================================================
// SLOT GENERATION
// =====================================================

/**
 * Generate all 90-minute slots for a given date
 * 
 * @param date - Date string "YYYY-MM-DD" or Date object
 * @param openingHour - Opening hour (default: 9)
 * @param closingHour - Closing hour (default: 23)
 * @param clubId - Club UUID (optional, for slot_id generation)
 * @param courtId - Court UUID (optional, for slot_id generation)
 * @returns Array of TimeSlot objects
 */
export function generate90mSlots(
  date: string | Date,
  openingHour: number = DEFAULT_OPENING_HOUR,
  closingHour: number = DEFAULT_CLOSING_HOUR,
  clubId?: string,
  courtId?: string
): TimeSlot[] {
  // Parse date string to Date object
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  // Create start and end times in local timezone
  const dayStart = new Date(`${dateStr}T${pad2(openingHour)}:00:00`);
  const dayEnd = new Date(`${dateStr}T${pad2(closingHour)}:00:00`);
  
  const slots: TimeSlot[] = [];
  const slotDurationMs = SLOT_DURATION_MINUTES * 60 * 1000;
  
  let currentTime = dayStart.getTime();
  const endTime = dayEnd.getTime();
  
  while (currentTime < endTime) {
    const nextTime = currentTime + slotDurationMs;
    
    // Create immutable Date objects for each slot
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(nextTime);
    
    const startISO = toISOWithOffset(slotStart);
    const endISO = toISOWithOffset(slotEnd);
    
    const slot: TimeSlot = {
      slot_id: clubId && courtId 
        ? buildSlotId(clubId, courtId, startISO, endISO)
        : `${startISO}_${endISO}`,
      start_at: startISO,
      end_at: endISO,
      label: `${pad2(slotStart.getHours())}:${pad2(slotStart.getMinutes())} - ${pad2(slotEnd.getHours())}:${pad2(slotEnd.getMinutes())}`,
    };
    
    slots.push(slot);
    currentTime = nextTime;
  }
  
  return slots;
}

/**
 * Get day boundaries in ISO format for querying database
 * Returns [dayStart, dayEnd] in UTC for Supabase queries
 * 
 * @param date - Date string "YYYY-MM-DD" or Date object
 * @param openingHour - Opening hour (default: 9)
 * @param closingHour - Closing hour (default: 23)
 */
export function getDayBoundaries(
  date: string | Date,
  openingHour: number = DEFAULT_OPENING_HOUR,
  closingHour: number = DEFAULT_CLOSING_HOUR
): { dayStart: string; dayEnd: string } {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  const dayStart = new Date(`${dateStr}T${pad2(openingHour)}:00:00`);
  const dayEnd = new Date(`${dateStr}T${pad2(closingHour)}:00:00`);
  
  return {
    dayStart: dayStart.toISOString(),
    dayEnd: dayEnd.toISOString(),
  };
}

/**
 * Get week boundaries (Monday to Sunday)
 * Returns [weekStart, weekEnd] in ISO format
 * 
 * @param date - Date string "YYYY-MM-DD" or Date object
 */
export function getWeekBoundaries(date: string | Date): {
  weekStart: string;
  weekEnd: string;
} {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Get Monday of the week (day 0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust when Sunday
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    weekStart: monday.toISOString(),
    weekEnd: sunday.toISOString(),
  };
}

/**
 * Format date for display
 * Ex: "Lundi 30 janvier 2026"
 */
export function formatDateLong(date: string | Date, locale: string = 'fr-FR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date for display (short)
 * Ex: "30/01/2026"
 */
export function formatDateShort(date: string | Date, locale: string = 'fr-FR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale);
}

/**
 * Check if a date string is today
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Get today's date as "YYYY-MM-DD"
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = pad2(today.getMonth() + 1);
  const day = pad2(today.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date and return "YYYY-MM-DD"
 */
export function addDays(date: string | Date, days: number): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  
  const year = result.getFullYear();
  const month = pad2(result.getMonth() + 1);
  const day = pad2(result.getDate());
  return `${year}-${month}-${day}`;
}
