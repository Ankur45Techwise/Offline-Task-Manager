import React, { useCallback } from "react";

import {
  BoardContainer,
  BoardHeader,
  BoardTitle,
  ColumnsContainer,
  AddTaskButton,
  ExportButton,
} from "../styles/BoardStyles";
import type { BoardState, Task } from "../types/task";
import { ColumnComponent } from "./Column";

type KanbanBoardProps = {
  boardState: BoardState;
  onAddTask: () => void;
  onExportTasks: () => void;
  onTaskMove: (taskId: string, newColumn: string) => void;
  getTaskDragState: (taskId: string) => {
    isDragging: boolean;
    dragRef: React.Ref<HTMLDivElement> | undefined;
  };
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  boardState,
  onAddTask,
  onExportTasks,
  onTaskMove,
  getTaskDragState,
  onEditTask,
  onDeleteTask,
}) => {
  const getTasksForColumn = useCallback(
    (columnId: string) => {
      return boardState.columns[columnId].taskIds
        .map((taskId) => boardState.tasks[taskId])
        .filter(Boolean);
    },
    [boardState.columns, boardState.tasks]
  );

  return (
    <BoardContainer>
      <BoardHeader>
        <BoardTitle>Task Manager</BoardTitle>
        <div>
          <AddTaskButton onClick={onAddTask}>Add Task</AddTaskButton>
          <ExportButton onClick={onExportTasks} style={{ marginLeft: "10px" }}>
            Export JSON
          </ExportButton>
        </div>
      </BoardHeader>

      <ColumnsContainer>
        {boardState.columnOrder.map((columnId) => {
          const column = boardState.columns[columnId];
          const tasks = getTasksForColumn(columnId);

          return (
            <ColumnComponent
              key={columnId}
              column={column}
              tasks={tasks}
              onTaskDrop={(taskId: string) => onTaskMove(taskId, columnId)}
              getTaskDragProps={getTaskDragState}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          );
        })}
      </ColumnsContainer>
    </BoardContainer>
  );
};
