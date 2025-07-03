import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

interface Props {
  task: Task;
  columnId: string;
  onEdit: (columnId: string, task: Task) => void;
  onDelete: (columnId: string, taskId: string) => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<Props> = ({
  task,
  columnId,
  onEdit,
  onDelete,
  isDragging,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id,
      data: { columnId },
      disabled: isDragging, // Disable sortable when used in DragOverlay
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
    boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-gray-100 p-3 rounded mb-3 shadow-sm"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">{task.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded ${
            task.priority === "high"
              ? "bg-red-200 text-red-800"
              : task.priority === "medium"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-green-200 text-green-800"
          }`}
        >
          {task.priority}
        </span>
      </div>
      <p className="text-xs mt-1 text-gray-600">{task.description}</p>
      <p className="text-xs mt-1">
        By: {task.createdBy} • Due: {task.dueDate}
      </p>
      {!isDragging && (
        <div className="mt-2 text-xs text-right space-x-2">
          <button
            onClick={() => onEdit(columnId, task)}
            className="text-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(columnId, task.id)}
            className="text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
