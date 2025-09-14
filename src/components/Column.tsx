import React from "react";

import {
  Column as StyledColumn,
  ColumnHeader,
  ColumnContent,
  EmptyState,
} from "../styles/BoardStyles";
import type { Column as ColumnType, Task } from "../types/task";
import { TaskCardComponent } from "./TaskCard";

type ColumnProps = {
  column: ColumnType;
  tasks: Task[];
  isDraggingOver?: boolean;
  onTaskDrop: (taskId: string, newColumn: string) => void;
  getTaskDragProps: (taskId: string) => {
    isDragging: boolean;
    dragRef: React.Ref<HTMLDivElement> | undefined;
  };
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
};

export const ColumnComponent: React.FC<ColumnProps> = ({
  column,
  tasks,
  isDraggingOver,
  onTaskDrop,
  getTaskDragProps,
  onEditTask,
  onDeleteTask,
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    onTaskDrop(taskId, column.id);
  };

  return (
    <StyledColumn isDraggingOver={isDraggingOver}>
      <ColumnHeader columnType={column.id}>
        {column.title} ({tasks.length})
      </ColumnHeader>
      <ColumnContent onDragOver={handleDragOver} onDrop={handleDrop}>
        {tasks.length === 0 ? (
          <EmptyState>Drop tasks here or create new ones</EmptyState>
        ) : (
          tasks.map((task) => {
            const { isDragging, dragRef } = getTaskDragProps(task.id);
            return (
              <TaskCardComponent
                key={task.id}
                task={task}
                isDragging={isDragging}
                dragRef={dragRef}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            );
          })
        )}
      </ColumnContent>
    </StyledColumn>
  );
};
