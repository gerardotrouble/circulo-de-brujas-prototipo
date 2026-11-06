import type { Activity } from "./student.models";

export function coursePage(
  activities: readonly Activity[],
  query: string,
  type: string,
  page: number,
  pageSize: number,
) {
  const search = query.toLowerCase();
  const filteredItems = activities.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search) ||
      item.instructor.toLowerCase().includes(search);
    const matchesType =
      type === "Todos" ||
      item.type.includes(type) ||
      item.type.includes(type.split(" ")[0]);
    return matchesSearch && matchesType;
  });
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const indexOfLastItem = page * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  return {
    filteredItems,
    totalPages,
    indexOfLastItem,
    indexOfFirstItem,
    currentItems,
  };
}
