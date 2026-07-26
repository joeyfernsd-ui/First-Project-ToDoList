"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Priority = "Low" | "Medium" | "High";
type Filter = "All" | "Pending" | "Completed";

type Task = {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
};

const STORAGE_KEY = "taskboard.tasks.v1";

function readTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((task): task is Task => Boolean(task) && typeof task === "object")
      .map((task) => ({ ...task, dueTime: typeof task.dueTime === "string" ? task.dueTime : "" }));
  } catch {
    return [];
  }
}

function formatDueDate(value: string) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [filter, setFilter] = useState<Filter>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDueTime, setEditDueTime] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("Medium");
  const [error, setError] = useState("");

  useEffect(() => {
    setTasks(readTasks());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  const pendingCount = tasks.filter((task) => !task.completed).length;
  const visibleTasks = useMemo(
    () =>
      tasks
        .filter((task) => filter === "All" || (filter === "Completed" ? task.completed : !task.completed))
        .sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt),
    [tasks, filter],
  );

  function addTask(event: FormEvent) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Enter a task before adding it.");
      return;
    }
    setTasks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: cleanTitle,
        dueDate,
        dueTime: dueDate ? dueTime : "",
        priority,
        completed: false,
        createdAt: Date.now(),
      },
    ]);
    setTitle("");
    setDueDate("");
    setDueTime("");
    setPriority("Medium");
    setError("");
  }

  function startEditing(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate);
    setEditDueTime(task.dueTime ?? "");
    setEditPriority(task.priority);
  }

  function saveEdit(taskId: string) {
    const cleanTitle = editTitle.trim();
    if (!cleanTitle) return;
    setTasks((current) => current.map((task) => (
      task.id === taskId
        ? {
            ...task,
            title: cleanTitle,
            dueDate: editDueDate,
            dueTime: editDueDate ? editDueTime : "",
            priority: editPriority,
          }
        : task
    )));
    setEditingId(null);
  }

  return (
    <main className="page-shell">
      <section className="taskboard" aria-labelledby="page-title">
        <header className="hero">
          <div className="brand-area">
            <Image
              className="brand-logo"
              src="/taskboard-logo.png"
              alt="TaskBoard"
              width={1730}
              height={480}
              priority
            />
            <h1 className="sr-only" id="page-title">TaskBoard</h1>
            <p className="eyebrow">Your work, clearly organised</p>
            <p className="subtitle">A simple place to plan what matters and finish it.</p>
          </div>
          <div className="count-card" aria-label={`${pendingCount} pending tasks`}>
            <strong>{pendingCount}</strong>
            <span>pending</span>
          </div>
        </header>

        <form className="add-panel" onSubmit={addTask} noValidate>
          <div className="field task-field">
            <label htmlFor="new-task">Task</label>
            <input
              id="new-task"
              value={title}
              onChange={(event) => { setTitle(event.target.value); if (error) setError(""); }}
              placeholder="What needs to be done?"
              aria-describedby={error ? "task-error" : undefined}
              aria-invalid={Boolean(error)}
            />
            {error && <span className="error" id="task-error" role="alert">{error}</span>}
          </div>
          <div className="field">
            <label htmlFor="due-date">Due date <span>(optional)</span></label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onInput={(event) => {
                setDueDate(event.currentTarget.value);
                if (!event.currentTarget.value) setDueTime("");
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="due-time">Due time <span>(24-hour)</span></label>
            <input
              id="due-time"
              type="time"
              lang="en-GB"
              step="60"
              value={dueTime}
              disabled={!dueDate}
              onInput={(event) => setDueTime(event.currentTarget.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <button className="add-button" type="submit"><span aria-hidden="true">+</span> Add task</button>
        </form>

        <div className="toolbar">
          <div>
            <h2>My tasks</h2>
            <p>{tasks.length === 0 ? "Add your first task above." : `${tasks.length} task${tasks.length === 1 ? "" : "s"} in total`}</p>
          </div>
          <div className="filters" aria-label="Filter tasks">
            {(["All", "Pending", "Completed"] as Filter[]).map((option) => (
              <button
                className={filter === option ? "active" : ""}
                type="button"
                key={option}
                aria-pressed={filter === option}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {!ready ? (
          <div className="empty-state" role="status">Loading your tasks...</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">[ ]</div>
            <h3>{filter === "All" ? "No tasks yet" : `No ${filter.toLowerCase()} tasks`}</h3>
            <p>{filter === "All" ? "Add a task to get your board moving." : "Try another filter to see your tasks."}</p>
          </div>
        ) : (
          <>
            <div className="task-table-head" aria-hidden="true">
              <span />
              <span>Task</span>
              <span>Priority</span>
              <span>Due date</span>
              <span>Time</span>
              <span>Actions</span>
            </div>
            <ul className="task-list" aria-label={`${filter} tasks`}>
              {visibleTasks.map((task) => (
                <li className={`task-card ${task.completed ? "completed" : ""}`} key={task.id}>
                  <button
                    type="button"
                    className="status-button"
                    aria-label={`Mark ${task.title} as ${task.completed ? "pending" : "completed"}`}
                    onClick={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))}
                  >
                    {task.completed && <span aria-hidden="true">X</span>}
                  </button>
                  {editingId === task.id ? (
                    <div className="task-edit-cell">
                      <form className="edit-form" onSubmit={(event) => { event.preventDefault(); saveEdit(task.id); }}>
                        <div className="edit-field edit-title-field">
                          <label htmlFor={`edit-${task.id}`}>Task</label>
                          <input id={`edit-${task.id}`} autoFocus value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                        </div>
                        <div className="edit-field edit-date-field">
                          <label htmlFor={`edit-date-${task.id}`}>Due date (optional)</label>
                          <input
                            id={`edit-date-${task.id}`}
                            type="date"
                            value={editDueDate}
                            onInput={(event) => {
                              setEditDueDate(event.currentTarget.value);
                              if (!event.currentTarget.value) setEditDueTime("");
                            }}
                          />
                        </div>
                        <div className="edit-field edit-time-field">
                          <label htmlFor={`edit-time-${task.id}`}>Due time (24-hour)</label>
                          <input
                            id={`edit-time-${task.id}`}
                            type="time"
                            lang="en-GB"
                            step="60"
                            value={editDueTime}
                            disabled={!editDueDate}
                            onInput={(event) => setEditDueTime(event.currentTarget.value)}
                          />
                        </div>
                        <div className="edit-field edit-priority-field">
                          <label htmlFor={`edit-priority-${task.id}`}>Priority</label>
                          <select
                            id={`edit-priority-${task.id}`}
                            value={editPriority}
                            onChange={(event) => setEditPriority(event.target.value as Priority)}
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </select>
                        </div>
                        <div className="edit-actions">
                          <button type="submit" disabled={!editTitle.trim()}>Save</button>
                          <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className="task-data task-title-cell" data-label="Task">
                        <h3>{task.title}</h3>
                      </div>
                      <div className="task-data task-priority-cell" data-label="Priority">
                        <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      </div>
                      <div className="task-data task-date-cell" data-label="Due date">
                        <span>{task.dueDate ? formatDueDate(task.dueDate) : "No date"}</span>
                      </div>
                      <div className="task-data task-time-cell" data-label="Time">
                        <span>{task.dueDate && task.dueTime ? task.dueTime : "--:--"}</span>
                      </div>
                      <div className="task-actions">
                        <button type="button" onClick={() => startEditing(task)} aria-label={`Edit ${task.title}`}>Edit</button>
                        <button className="delete" type="button" onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))} aria-label={`Delete ${task.title}`}>Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <footer>TaskBoard v0.2.1 | Saved on this device | No account needed</footer>
    </main>
  );
}

