import React, { useState, useEffect } from "react";
import type { Task } from "../types";
import { v4 as uuid } from "uuid";
import {
  PencilIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface TaskFormProps {
  columnId: string;
  existingTask?: Task;
  onSave: (task: Task) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        {existingTask ? "Edit Task" : "New Task"}
      </h2>

      <div className="space-y-4">
        <div className="relative">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <PencilIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
          <input
            id="title"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <DocumentTextIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
          <textarea
            id="description"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor="createdBy"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Created By
          </label>
          <UserIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
          <input
            id="createdBy"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
            placeholder="Enter creator's name"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Due Date
          </label>
          <CalendarIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
          <input
            id="dueDate"
            type="date"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority
          </label>
          <select
            id="priority"
            className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
          >
            <option value="low" className="flex items-center gap-2">
              ✅ Low
            </option>
            <option value="medium" className="flex items-center gap-2">
              ⚠️ Medium
            </option>
            <option value="high" className="flex items-center gap-2">
              🔥 High
            </option>
          </select>
          <ChevronDownIcon className="absolute right-3 top-8 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors cursor-pointer flex items-center gap-2"
          onClick={onClose}
        >
          <XMarkIcon className="h-5 w-5" />
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          {existingTask ? "Save" : "Add"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
