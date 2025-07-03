
import React, { useState, useEffect } from "react";
import type { Task } from "../types";
import { v4 as uuid } from "uuid";

interface TaskFormProps {
  columnId: string;
  existingTask?: Task;
  onSave: (task: Task) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  columnId,
  existingTask,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description);
      setCreatedBy(existingTask.createdBy);
      setPriority(existingTask.priority);
      setDueDate(existingTask.dueDate);
    }
  }, [existingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: existingTask ? existingTask.id : uuid(),
      title,
      description,
      createdBy,
      priority,
      dueDate,
    };
    onSave(newTask);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-2">
        {existingTask ? "Edit Task" : "New Task"}
      </h2>
      <input
        className="w-full border p-2 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Created By"
        value={createdBy}
        onChange={(e) => setCreatedBy(e.target.value)}
        required
      />
      <input
        type="date"
        className="w-full border p-2 rounded"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <select
        className="w-full border p-2 rounded"
        value={priority}
        onChange={(e) => setPriority(e.target.value as any)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="px-4 py-2 rounded border"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {existingTask ? "Save" : "Add"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
