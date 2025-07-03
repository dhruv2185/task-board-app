// BoardDetailPage.tsx – integrates ColumnDndWrapper and TaskDndWrapper
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useBoard } from "../context/BoardContext";
import { v4 as uuid } from "uuid";
import type { Task } from "../types";
import Modal from "../components/Modal";
import TaskForm from "../components/TaskForm";
import TaskDndWrapper from "../components/TaskDndWrapper";
import ColumnDndWrapper from "../components/ColumnDndWrapper";

const priorities = ["low", "medium", "high"] as const;

const BoardDetailPage: React.FC = () => {
  const { id } = useParams();
  const { boards, setBoards } = useBoard();
  const boardIndex = boards.findIndex((b) => b.id === id);
  const board = boards[boardIndex];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [columnTitle, setColumnTitle] = useState("");
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");

  const updateBoard = () => {
    const newBoards = [...boards];
    newBoards[boardIndex] = board;
    setBoards(newBoards);
  };

  const matchesFilter = (task: Task) =>
    (!search ||
      task.title.includes(search) ||
      task.description.includes(search)) &&
    (!filterPriority || task.priority === filterPriority) &&
    (!filterDueDate || task.dueDate === filterDueDate);

  const openTaskModal = (colId: string, task?: Task) => {
    setSelectedColumnId(colId);
    setEditingTask(task || null);
    setModalOpen(true);
  };

  const deleteTask = (colId: string, taskId: string) => {
    const column = board.columns.find((c) => c.id === colId);
    if (!column) return;
    column.tasks = column.tasks.filter((t) => t.id !== taskId);
    updateBoard();
  };

  const addColumn = () => {
    if (!columnTitle.trim()) return;
    if (editingColumnIndex !== null) {
      board.columns[editingColumnIndex].title = columnTitle;
      setEditingColumnIndex(null);
    } else {
      board.columns.push({ id: uuid(), title: columnTitle, tasks: [] });
    }
    setColumnTitle("");
    updateBoard();
  };

  if (!board) return <div className="p-4">Board not found.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">{board.title}</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          className="border p-2 rounded"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          className="border p-2 rounded"
          type="date"
          value={filterDueDate}
          onChange={(e) => setFilterDueDate(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            className="border p-2 rounded"
            placeholder="New column title"
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={addColumn}
          >
            {editingColumnIndex !== null ? "Save" : "+ Add Column"}
          </button>
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-6">
        <ColumnDndWrapper
          columns={board.columns}
          onReorder={(newCols) => {
            board.columns = newCols;
            updateBoard();
          }}
          renderColumn={(col) => (
            <div
              key={col.id}
              className="min-w-[280px] bg-white rounded-xl shadow p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">{col.title}</h2>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => {
                      setColumnTitle(col.title);
                      setEditingColumnIndex(
                        board.columns.findIndex((c) => c.id === col.id)
                      );
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => {
                      board.columns = board.columns.filter(
                        (c) => c.id !== col.id
                      );
                      updateBoard();
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              <TaskDndWrapper
                columnId={col.id}
                tasks={col.tasks.filter(matchesFilter)}
                renderTask={(task) => (
                  <div
                    key={task.id}
                    className="bg-gray-100 p-3 rounded mb-3 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-sm">{task.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded bg-${
                          task.priority === "high"
                            ? "red"
                            : task.priority === "medium"
                            ? "yellow"
                            : "green"
                        }-200`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-gray-600">
                      {task.description}
                    </p>
                    <p className="text-xs mt-1">
                      By: {task.createdBy} • Due: {task.dueDate}
                    </p>
                    <div className="mt-2 text-xs text-right space-x-2">
                      <button
                        onClick={() => openTaskModal(col.id, task)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(col.id, task.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
                onReorder={(newTasks) => {
                  col.tasks = newTasks;
                  updateBoard();
                }}
              />

              <button
                onClick={() => openTaskModal(col.id)}
                className="text-blue-600 text-sm mt-2"
              >
                + Add Task
              </button>
            </div>
          )}
        />
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <TaskForm
          columnId={selectedColumnId!}
          existingTask={editingTask ?? undefined}
          onClose={() => setModalOpen(false)}
          onSave={(task) => {
            const column = board.columns.find((c) => c.id === selectedColumnId);
            if (!column) return;
            if (editingTask) {
              const index = column.tasks.findIndex(
                (t) => t.id === editingTask.id
              );
              column.tasks[index] = task;
            } else {
              column.tasks.push(task);
            }
            updateBoard();
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default BoardDetailPage;
