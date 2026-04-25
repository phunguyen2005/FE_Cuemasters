const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export const ensureUtc = (value: string) =>
  /[zZ]$|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;

export const formatVietnamTime = (value?: string | null) => {
  if (!value) return '--:--';

  const date = new Date(ensureUtc(value));
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString('vi-VN', {
        timeZone: VIETNAM_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
};

export const formatVietnamDateTime = (value?: string | null) => {
  if (!value) return '--';

  const date = new Date(ensureUtc(value));
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('vi-VN', {
        timeZone: VIETNAM_TIME_ZONE,
        hour12: false,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

export const formatScheduledTime = (value?: string | null) => {
  if (!value) return '--:--';

  const match = value.match(/(?:T|^)(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : value;
};

export const formatScheduledDateParts = (value?: string | null) => {
  if (!value) return null;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;

  const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
  const parts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };

  const parsed = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== parts.year ||
    parsed.getMonth() !== parts.month - 1 ||
    parsed.getDate() !== parts.day ||
    parsed.getHours() !== parts.hour ||
    parsed.getMinutes() !== parts.minute ||
    parsed.getSeconds() !== parts.second
  ) {
    return null;
  }

  return parts;
};

export const formatScheduledDate = (value?: string | null) => {
  const parts = formatScheduledDateParts(value);
  return parts
    ? `${String(parts.day).padStart(2, '0')}/${String(parts.month).padStart(2, '0')}/${parts.year}`
    : '--/--/----';
};
