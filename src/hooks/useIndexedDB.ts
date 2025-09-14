import { useState, useEffect } from "react";

import { dbService } from "../services/db";
import type { BoardState, Task } from "../types/task";

export function useIndexedDB() {
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        setLoading(true);
        await dbService.init();
        await dbService.initializeDefaultData();
        const state = await dbService.getBoardState();
        setBoardState(state);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize database"
        );
      } finally {
        setLoading(false);
      }
    };

    initializeDB();
  }, []);

  const refreshBoardState = async () => {
    try {
      const state = await dbService.getBoardState();
      setBoardState(state);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh board state"
      );
    }
  };

  const addTask = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add task to database
      await dbService.addTask(newTask);

      // Update column's taskIds array
      if (boardState) {
        const updatedColumns = { ...boardState.columns };
        updatedColumns[task.column] = {
          ...updatedColumns[task.column],
          taskIds: [...updatedColumns[task.column].taskIds, newTask.id],
        };

        // Save updated columns to database
        await dbService.saveColumns(Object.values(updatedColumns));

        // Refresh the board state to get the latest data
        await refreshBoardState();
      }

      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      if (!boardState) throw new Error("Board state not loaded");

      const existingTask = boardState.tasks[taskId];
      if (!existingTask) throw new Error("Task not found");

      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: new Date(),
      };

      await dbService.updateTask(updatedTask);

      // Handle column change
      if (updates.column && updates.column !== existingTask.column) {
        const updatedColumns = { ...boardState.columns };

        // Remove from old column
        updatedColumns[existingTask.column].taskIds = updatedColumns[
          existingTask.column
        ].taskIds.filter((id) => id !== taskId);

        // Add to new column
        updatedColumns[updates.column].taskIds.push(taskId);

        // Save updated columns to database
        await dbService.saveColumns(Object.values(updatedColumns));
      }

      // Refresh the board state
      await refreshBoardState();
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      if (!boardState) throw new Error("Board state not loaded");

      const task = boardState.tasks[taskId];
      if (!task) throw new Error("Task not found");

      await dbService.deleteTask(taskId);

      // Update column's taskIds array
      const updatedColumns = { ...boardState.columns };
      updatedColumns[task.column].taskIds = updatedColumns[
        task.column
      ].taskIds.filter((id) => id !== taskId);

      // Save updated columns to database
      await dbService.saveColumns(Object.values(updatedColumns));

      // Refresh the board state
      await refreshBoardState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      throw err;
    }
  };

  return {
    boardState,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
  };
}
