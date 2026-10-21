function formatDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function dateInMonth(reference: Date, monthsAgo: number, day: number): string {
  const date = new Date(
    reference.getFullYear(),
    reference.getMonth() - monthsAgo,
    day,
  );
  return formatDate(date);
}

export function generateSampleCsv(referenceDate = new Date()): string {
  const today = formatDate(referenceDate);
  return [
    "date,item,quantity,price",
    `${dateInMonth(referenceDate, 2, 5)},Ankara dress,3,30000`,
    `${dateInMonth(referenceDate, 2, 12)},Silk scarf,4,10000`,
    `${dateInMonth(referenceDate, 2, 18)},Tote bag,2,12000`,
    `${dateInMonth(referenceDate, 2, 20)},Belts,3,10000`,
    `${dateInMonth(referenceDate, 1, 5)},Ankara dress,6,30000`,
    `${dateInMonth(referenceDate, 1, 12)},Tote bag,2,12000`,
    `${dateInMonth(referenceDate, 1, 18)},Belts,3,4000`,
    `${dateInMonth(referenceDate, 1, 20)},Linen shirt,2,15000`,
    `${today},Ankara dress,1,30000`,
  ].join("\n");
}
