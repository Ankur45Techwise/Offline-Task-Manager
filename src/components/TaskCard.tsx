import React from "react";

import {
  TaskCard as StyledTaskCard,
  TaskTitle,
  TaskDescription,
  TaskMeta,
} from "../styles/BoardStyles";
import type { Task } from "../types/task";

type TaskCardProps = {
  task: Task;
  isDragging?: boolean;
  dragRef?: React.Ref<HTMLDivElement> | undefined;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const TaskCardComponent: React.FC<TaskCardProps> = ({
  task,
  isDragging,
  dragRef,
  onEdit,
  onDelete,
}) => {
  return (
    <StyledTaskCard ref={dragRef} isDragging={isDragging}>
      <TaskTitle>{task.title}</TaskTitle>
      {task.description && (
        <TaskDescription>{task.description}</TaskDescription>
      )}
      <TaskMeta>
        <span>Created: {formatDate(task.createdAt)}</span>
        <div>
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              style={{
                background: "#3498db",
                color: "white",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.8rem",
                marginRight: "5px",
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              style={{
                background: "#e74c3c",
                color: "white",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Delete
            </button>
          )}
        </div>
      </TaskMeta>
    </StyledTaskCard>
  );
};
