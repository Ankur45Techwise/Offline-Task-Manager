export type DragItem = {
  type: "task";
  task: {
    id: string;
    column: string;
    index: number;
  };
};

export const ItemTypes = {
  TASK: "task",
} as const;
