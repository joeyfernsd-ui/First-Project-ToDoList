export type ReminderTask = {
  id: string;
  completed: boolean;
  reminderAt: number | null;
  notifiedAt: number | null;
};

export function getReminderTime(dueDate: string, dueTime: string) {
  if (!dueDate || !dueTime) return null;
  const reminderAt = new Date(`${dueDate}T${dueTime}:00`).getTime();
  return Number.isNaN(reminderAt) ? null : reminderAt;
}

export function getDueReminderIds(tasks: ReminderTask[], now: number) {
  return new Set(
    tasks
      .filter((task) => (
        !task.completed
        && task.notifiedAt === null
        && task.reminderAt !== null
        && task.reminderAt <= now
      ))
      .map((task) => task.id),
  );
}

export function markRemindersNotified<T extends ReminderTask>(
  tasks: T[],
  notifiedIds: Set<string>,
  notifiedAt: number,
) {
  return tasks.map((task) => (
    notifiedIds.has(task.id) ? { ...task, notifiedAt } : task
  ));
}

export function snoozeReminder<T extends ReminderTask>(
  tasks: T[],
  taskId: string,
  snoozedUntil: number,
) {
  return tasks.map((task) => (
    task.id === taskId
      ? { ...task, reminderAt: snoozedUntil, notifiedAt: null }
      : task
  ));
}

