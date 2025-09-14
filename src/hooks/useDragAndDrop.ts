import { useDrag, useDrop } from "react-dnd";

import { ItemTypes } from "../types/dragDrop";

interface DragResult {
  isDragging: boolean;
  drag: (node: HTMLElement) => void;
  drop: (node: HTMLElement) => void;
  isOver: boolean;
}

export function useTaskDragAndDrop(
  taskId: string,
  currentColumn: string,
  index: number,
  onDrop: (taskId: string, newColumn: string, newIndex: number) => void
): DragResult {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: {
      id: taskId,
      column: currentColumn,
      index,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { id: string; column: string; index: number }) => {
      if (item.id !== taskId) {
        onDrop(item.id, currentColumn, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return {
    isDragging,
    drag,
    drop,
    isOver,
  };
}
