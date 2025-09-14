export type Task = {
  id: string;
  title: string;
  description?: string;
  column: "todo" | "in-progress" | "done";
  createdAt: Date;
  updatedAt: Date;
};

export type ColumnId = "todo" | "in-progress" | "done";

export type Column = {
  id: ColumnId;
  title: string;
  taskIds: string[];
};

export type BoardState = {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: ("todo" | "in-progress" | "done")[];
};
