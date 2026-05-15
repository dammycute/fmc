export const formatMoney = (amount: number): string => {
  const absolute = Math.abs(amount || 0);
  const sign = amount < 0 ? '-' : '';

  if (absolute >= 1_000_000) {
    return `${sign}£${(absolute / 1_000_000).toFixed(1)}M`;
  }

  if (absolute >= 1_000) {
    return `${sign}£${(absolute / 1_000).toFixed(0)}K`;
  }

  return `${sign}£${absolute.toFixed(0)}`;
};
