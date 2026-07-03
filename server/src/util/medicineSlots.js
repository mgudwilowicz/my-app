export const VALID_SLOTS = ["morning", "noon", "evening", "night"];

export const SLOT_TIMES = {
  morning: "08:00",
  noon: "12:00",
  evening: "18:00",
  night: "21:00",
};

export function isSlotPast(slot, date) {
  const [hours, minutes] = SLOT_TIMES[slot].split(":").map(Number);
  const slotDate = new Date(`${date}T00:00:00`);
  slotDate.setHours(hours, minutes, 0, 0);
  return Date.now() >= slotDate.getTime();
}
