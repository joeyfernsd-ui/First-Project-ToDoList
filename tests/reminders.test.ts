import assert from "node:assert/strict";
import test from "node:test";
import {
  getDueReminderIds,
  getReminderTime,
  markRemindersNotified,
  type ReminderTask,
} from "../app/reminders.ts";

test("stores a local reminder timestamp only when date and time are present", () => {
  assert.equal(getReminderTime("", "09:30"), null);
  assert.equal(getReminderTime("2026-08-01", ""), null);
  assert.equal(
    getReminderTime("2026-08-01", "09:30"),
    new Date("2026-08-01T09:30:00").getTime(),
  );
});

test("finds an overdue reminder immediately when a later check resumes", () => {
  const reminderAt = new Date("2026-08-01T09:30:00").getTime();
  const tasks: ReminderTask[] = [{
    id: "delayed",
    completed: false,
    reminderAt,
    notifiedAt: null,
  }];

  assert.deepEqual([...getDueReminderIds(tasks, reminderAt - 1)], []);
  assert.deepEqual([...getDueReminderIds(tasks, reminderAt + 60_000)], ["delayed"]);
});

test("skips completed, future, and previously notified reminders", () => {
  const now = 10_000;
  const tasks: ReminderTask[] = [
    { id: "due", completed: false, reminderAt: now, notifiedAt: null },
    { id: "future", completed: false, reminderAt: now + 1, notifiedAt: null },
    { id: "completed", completed: true, reminderAt: now - 1, notifiedAt: null },
    { id: "notified", completed: false, reminderAt: now - 1, notifiedAt: now - 5 },
    { id: "unscheduled", completed: false, reminderAt: null, notifiedAt: null },
  ];

  assert.deepEqual([...getDueReminderIds(tasks, now)], ["due"]);
});

test("marks delivered reminders so later checks cannot duplicate them", () => {
  const tasks: ReminderTask[] = [{
    id: "due",
    completed: false,
    reminderAt: 1_000,
    notifiedAt: null,
  }];
  const deliveredAt = 2_000;
  const marked = markRemindersNotified(tasks, new Set(["due"]), deliveredAt);

  assert.equal(marked[0].notifiedAt, deliveredAt);
  assert.deepEqual([...getDueReminderIds(marked, deliveredAt + 1)], []);
});

