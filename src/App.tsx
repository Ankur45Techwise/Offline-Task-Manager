import React, { useState, useCallback } from "react";

import { KanbanBoard } from "./components/KanbanBoard";
import { useIndexedDB } from "./hooks/useIndexedDB";
import { GlobalStyles, OfflineIndicator } from "./styles/GlobalStyles";
import type { Task, ColumnId } from "./types/task";

function App() {
  const { boardState, loading, error, addTask, updateTask, deleteTask } =
    useIndexedDB();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleAddTask = useCallback(() => {
    setShowAddTaskModal(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowEditTaskModal(true);
  }, []);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (window.confirm("Are you sure you want to delete this task?")) {
        try {
          await deleteTask(taskId);
        } catch (err) {
          console.error("Failed to delete task:", err);
        }
      }
    },
    [deleteTask]
  );

  const handleCreateTask = useCallback(
    async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      try {
        await addTask(taskData);
        setShowAddTaskModal(false);
      } catch (err) {
        console.error("Failed to create task:", err);
      }
    },
    [addTask]
  );

  const handleUpdateTask = useCallback(
    async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      if (!editingTask) return;

      try {
        await updateTask(editingTask.id, taskData);
        setShowEditTaskModal(false);
        setEditingTask(null);
      } catch (err) {
        console.error("Failed to update task:", err);
      }
    },
    [editingTask, updateTask]
  );

  const handleTaskMove = useCallback(
    async (taskId: string, newColumn: string) => {
      if (!boardState) return;

      try {
        const task = boardState.tasks[taskId];
        if (!task || task.column === newColumn) return;

        await updateTask(taskId, { column: newColumn as ColumnId });
      } catch (err) {
        console.error("Failed to move task:", err);
      }
    },
    [boardState, updateTask]
  );

  const handleExportTasks = useCallback(() => {
    if (boardState) {
      const exportData = {
        tasks: Object.values(boardState.tasks),
        columns: Object.values(boardState.columns),
        exportedAt: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tasks-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [boardState]);

  const getTaskDragState = useCallback(
    (taskId: string) => {
      return {
        isDragging: draggingTaskId === taskId,
        dragRef: (node: HTMLElement) => {
          if (node) {
            node.draggable = true;
            node.ondragstart = (e) => {
              setDraggingTaskId(taskId);
              if (e.dataTransfer) {
                e.dataTransfer.setData("text/plain", taskId);
                e.dataTransfer.effectAllowed = "move";
              }
            };
            node.ondragend = () => {
              setDraggingTaskId(null);
            };
          }
        },
      };
    },
    [draggingTaskId]
  );

  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );
        })
        .catch((error) => {
          console.log("ServiceWorker registration failed: ", error);
        });
    }
  }, []);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Task Manager</h1>
          <p>Loading database...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <GlobalStyles />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Task Manager</h1>
          <p style={{ color: "red" }}>Error: {error}</p>
        </div>
      </>
    );
  }

  // Add Task Modal
  const AddTaskModal = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [column, setColumn] = useState<ColumnId>("todo");

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        handleCreateTask({ title, description, column });
      },
      [column, description, title]
    );

    if (!showAddTaskModal) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            width: "400px",
            maxWidth: "90%",
          }}
        >
          <h2>Add New Task</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label>Title *</label>
              <br />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Description</label>
              <br />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "8px", minHeight: "80px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Column</label>
              <br />
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value as ColumnId)}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" style={{ padding: "10px 20px" }}>
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                style={{ padding: "10px 20px" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Task Modal
  const EditTaskModal = () => {
    const [title, setTitle] = useState(editingTask?.title);
    const [description, setDescription] = useState(
      editingTask?.description || ""
    );
    const [column, setColumn] = useState<ColumnId>(
      editingTask?.column as ColumnId
    );

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (title) handleUpdateTask({ title, description, column });
      },
      [column, description, title]
    );

    if (!showEditTaskModal || !editingTask) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            width: "400px",
            maxWidth: "90%",
          }}
        >
          <h2>Edit Task</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label>Title *</label>
              <br />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Description</label>
              <br />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "8px", minHeight: "80px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Column</label>
              <br />
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value as ColumnId)}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" style={{ padding: "10px 20px" }}>
                Update Task
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditTaskModal(false);
                  setEditingTask(null);
                }}
                style={{ padding: "10px 20px" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <GlobalStyles />
      <OfflineIndicator isOnline={isOnline}>
        {isOnline ? "Online" : "Offline"}
      </OfflineIndicator>
      <KanbanBoard
        boardState={boardState!}
        onAddTask={handleAddTask}
        onExportTasks={handleExportTasks}
        onTaskMove={handleTaskMove}
        getTaskDragState={
          getTaskDragState as (taskId: string) => {
            isDragging: boolean;
            dragRef: React.Ref<HTMLDivElement> | undefined;
          }
        }
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />
      <AddTaskModal />
      <EditTaskModal />
    </>
  );
}

export default App;
