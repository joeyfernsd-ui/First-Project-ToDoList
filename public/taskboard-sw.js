const SNOOZE_MINUTES = 5;

self.addEventListener("notificationclick", (event) => {
  const notificationData = event.notification.data || {};
  const shouldSnooze = event.action === "snooze-5" && notificationData.taskId;
  event.notification.close();

  event.waitUntil((async () => {
    const openClients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    const taskBoardClient = openClients.find((client) => (
      client.url.startsWith(self.location.origin)
    ));

    if (shouldSnooze) {
      if (taskBoardClient) {
        taskBoardClient.postMessage({
          type: "TASKBOARD_SNOOZE",
          taskId: notificationData.taskId,
          minutes: SNOOZE_MINUTES,
        });
        await taskBoardClient.focus();
        return;
      }

      await self.clients.openWindow(
        `/?snoozeTask=${encodeURIComponent(notificationData.taskId)}`,
      );
      return;
    }

    if (taskBoardClient) {
      await taskBoardClient.focus();
    } else {
      await self.clients.openWindow("/");
    }
  })());
});

