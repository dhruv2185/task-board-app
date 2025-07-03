
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useBoard } from "../context/BoardContext";
import { v4 as uuid } from "uuid";
import type { Task } from "../types";
import Modal from "../components/Modal";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";

import {
  DndContext,
  closestCenter,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";

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
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

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
  const EmptyDropZone: React.FC<{ columnId: string }> = ({ columnId }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: columnId,
      data: { columnId },
    });

    return (
      <div
        ref={setNodeRef}
        className={`min-h-[100px] flex items-center justify-center border-2 border-dashed rounded ${
          isOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
        } text-sm text-gray-500`}
      >
        Drop task here
      </div>
    );
  };
  const handleDragOver = (event: DragOverEvent) => {
    const columnId = event.over?.data?.current?.columnId;
    if (columnId) {
      setHoveredColumnId(columnId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setHoveredColumnId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activeColumnId = active.data.current?.columnId;
    const overColumnId = over.data.current?.columnId || overId;

    if (!activeColumnId || !overColumnId) return;

    const sourceCol = board.columns.find((c) => c.id === activeColumnId);
    const targetCol = board.columns.find((c) => c.id === overColumnId);
    if (!sourceCol || !targetCol) return;

    const activeIndex = sourceCol.tasks.findIndex((t) => t.id === activeId);
    const overIndex = targetCol.tasks.findIndex((t) => t.id === overId);
    const task = sourceCol.tasks[activeIndex];
    if (!task) return;

    if (sourceCol.id === targetCol.id) {
      // Reorder within the same column
      targetCol.tasks = arrayMove(targetCol.tasks, activeIndex, overIndex);
    } else {
      // Move across columns
      sourceCol.tasks.splice(activeIndex, 1);
      const insertAt = overIndex >= 0 ? overIndex : targetCol.tasks.length;
      targetCol.tasks.splice(insertAt, 0, task);
    }

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-6 overflow-x-auto pb-6">
          {board.columns.map((col) => (
            <div
              key={col.id}
              className={`min-w-[280px] flex-shrink-0 rounded-xl shadow p-4 transition-colors duration-200 ${
                hoveredColumnId === col.id ? "bg-blue-50" : "bg-white"
              }`}
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

              <SortableContext
                items={col.tasks.length ? col.tasks.map((t) => t.id) : [col.id]}
                strategy={rectSortingStrategy}
              >
                {col.tasks.length === 0 ? (
                  <EmptyDropZone columnId={col.id} />
                ) : (
                  col.tasks
                    .filter(matchesFilter)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        columnId={col.id}
                        onEdit={openTaskModal}
                        onDelete={deleteTask}
                      />
                    ))
                )}
              </SortableContext>

              <button
                onClick={() => openTaskModal(col.id)}
                className="text-blue-600 text-sm mt-2"
              >
                + Add Task
              </button>
            </div>
          ))}
        </div>
      </DndContext>

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
