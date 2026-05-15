export const normalizeData = (data: any): any[] => {
  if (!data) return [];
  const items = Array.isArray(data) ? data : (data?.results || []);
  return items.map((item: any) => ({ ...item, id: item.id != null ? String(item.id) : item.id }));
};
