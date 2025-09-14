import styled from "styled-components";

export const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

export const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
`;

export const BoardTitle = styled.h1`
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
`;

export const ColumnsContainer = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  overflow-x: auto;
  padding-bottom: 20px;
`;

export const Column = styled.div<{ isDraggingOver?: boolean }>`
  flex: 1;
  min-width: 300px;
  max-width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  ${(props) =>
    props.isDraggingOver &&
    `
    background: #e8f4fd;
    border: 2px dashed #3498db;
  `}
`;

export const ColumnHeader = styled.div<{ columnType: string }>`
  padding: 15px;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  font-size: 1.1rem;
  color: white;

  ${(props) => {
    switch (props.columnType) {
      case "todo":
        return "background: #e74c3c;";
      case "in-progress":
        return "background: #f39c12;";
      case "done":
        return "background: #27ae60;";
      default:
        return "background: #95a5a6;";
    }
  }}
`;

export const ColumnContent = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  min-height: 200px;
`;

export const TaskCard = styled.div<{ isDragging?: boolean }>`
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: move;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  ${(props) =>
    props.isDragging &&
    `
    opacity: 0.5;
    transform: rotate(2deg);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  `}

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

export const TaskTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  word-wrap: break-word;
`;

export const TaskDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.4;
  word-wrap: break-word;
`;

export const TaskMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #95a5a6;
`;

export const AddTaskButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #2980b9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ExportButton = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #229954;
    transform: translateY(-1px);
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #95a5a6;
  font-style: italic;
`;

export const OfflineIndicator = styled.div<{ isOnline: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 1000;

  ${(props) =>
    props.isOnline
      ? `
    background: #27ae60;
    color: white;
  `
      : `
    background: #e74c3c;
    color: white;
  `}
`;
