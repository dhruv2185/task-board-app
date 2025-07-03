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
      disabled: isDragging,
    });

  const style = {
    transition: transition || "transform 0.2s ease",
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 1000 : 1,
    boxShadow: isDragging
      ? "0 8px 24px rgba(0,0,0,0.15)"
      : "0 2px 8px rgba(0,0,0,0.05)",
    transform: isDragging
      ? `${CSS.Transform.toString(transform)} rotate(2deg)`
      : CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-white p-4 rounded-lg mb-3 border border-gray-200 hover:border-gray-300 transition-all cursor-grab"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-base text-gray-800 line-clamp-2">
          {task.title}
        </h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full capitalize flex-shrink-0 ${
            task.priority === "high"
              ? "bg-red-100 text-red-700"
              : task.priority === "medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
        {task.description}
      </p>
      <p className="text-xs text-gray-500 mt-2">
        By: {task.createdBy} • Due: {task.dueDate}
      </p>
      {!isDragging && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => onEdit(columnId, task)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 active:bg-blue-300 transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(columnId, task.id)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 active:bg-red-300 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
