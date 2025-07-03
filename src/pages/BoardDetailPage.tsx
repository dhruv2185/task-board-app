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
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  PlusIcon,
  ChevronDownIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

const priorities = ["LOW", "MEDIUM", "HIGH"] as const;
const sortOptions = [
  { value: "", label: "Filter By..." },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "dueDate-asc", label: "Due Date (Earliest)" },
  { value: "dueDate-desc", label: "Due Date (Latest)" },
] as const;

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
  const [sortBy, setSortBy] = useState("");
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const updateBoard = () => {
    const newBoards = [...boards];
    newBoards[boardIndex] = board;
    setBoards(newBoards);
  };

  const matchesFilter = (task: Task) =>
    (!search ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase())) &&
    (!filterPriority || task.priority === filterPriority) &&
    (!filterDueDate || task.dueDate === filterDueDate);

  const sortTasks = (tasks: Task[]) => {
    if (!sortBy) return tasks;
    const [key, direction] = sortBy.split("-");
    return [...tasks].sort((a, b) => {
      if (key === "title") {
        return direction === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (key === "dueDate") {
        return direction === "asc"
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      return 0;
    });
  };

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
      id: `dropzone-${columnId}`,
      data: { columnId },
    });

    return (
      <div
        ref={setNodeRef}
        className={`min-h-[120px] flex items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
          isOver ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-100"
        } text-sm text-gray-500 font-medium`}
      >
        Drop task here
      </div>
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id.toString();
    const activeColumnId = active.data.current?.columnId;
    const sourceCol = board.columns.find((c) => c.id === activeColumnId);
    if (sourceCol) {
      const task = sourceCol.tasks.find((t) => t.id === activeId);
      setActiveTask(task || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const columnId =
        over.data.current?.columnId ||
        over.id.toString().replace("dropzone-", "");
      setHoveredColumnId(columnId);
    } else {
      setHoveredColumnId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setHoveredColumnId(null);
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    const activeColumnId = active.data.current?.columnId;
    const overColumnId =
      over.data.current?.columnId || overId.replace("dropzone-", "");

    if (!activeColumnId || !overColumnId) return;

    const sourceCol = board.columns.find((c) => c.id === activeColumnId);
    const targetCol = board.columns.find((c) => c.id === overColumnId);
    if (!sourceCol || !targetCol) return;

    const activeIndex = sourceCol.tasks.findIndex((t) => t.id === activeId);
    const overIndex = targetCol.tasks.findIndex((t) => t.id === overId);
    const task = sourceCol.tasks[activeIndex];
    if (!task) return;

    if (sourceCol.id === targetCol.id) {
      targetCol.tasks = arrayMove(
        targetCol.tasks,
        activeIndex,
        overIndex >= 0 ? overIndex : targetCol.tasks.length
      );
    } else {
      sourceCol.tasks.splice(activeIndex, 1);
      const insertAt = overIndex >= 0 ? overIndex : targetCol.tasks.length;
      targetCol.tasks.splice(insertAt, 0, task);
    }

    updateBoard();
  };

  if (!board)
    return <div className="p-6 text-gray-600 text-lg">Board not found.</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          {board.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              {priorities.map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              type="date"
              value={filterDueDate}
              onChange={(e) => setFilterDueDate(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-2">
            <PlusIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              placeholder="New column title"
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer text-sm font-medium flex items-center gap-2"
            onClick={addColumn}
          >
            <PlusIcon className="h-5 w-5" />
            {editingColumnIndex !== null ? "Save Column" : "Add Column"}
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-6">
            {board.columns.map((col) => (
              <div
                key={col.id}
                className={`min-w-[300px] flex-shrink-0 rounded-xl shadow-lg p-4 bg-white transition-all duration-200 flex flex-col ${
                  hoveredColumnId === col.id
                    ? "ring-2 ring-blue-300 bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {col.title}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setColumnTitle(col.title);
                        setEditingColumnIndex(
                          board.columns.findIndex((c) => c.id === col.id)
                        );
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer flex items-center gap-1"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer flex items-center gap-1"
                      onClick={() => {
                        board.columns = board.columns.filter(
                          (c) => c.id !== col.id
                        );
                        updateBoard();
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <SortableContext
                  items={col.tasks
                    .map((t) => t.id)
                    .concat(`dropzone-${col.id}`)}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex-1">
                    {col.tasks.length === 0 ||
                    col.tasks.filter(matchesFilter).length === 0 ? (
                      <EmptyDropZone columnId={col.id} />
                    ) : (
                      sortTasks(col.tasks.filter(matchesFilter)).map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          columnId={col.id}
                          onEdit={openTaskModal}
                          onDelete={deleteTask}
                          isDragging={activeTask?.id === task.id}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>

                <button
                  onClick={() => openTaskModal(col.id)}
                  className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium mt-3 cursor-pointer flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Task
                </button>
              </div>
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                columnId={activeTask.id}
                onEdit={() => {}}
                onDelete={() => {}}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <TaskForm
            columnId={selectedColumnId!}
            existingTask={editingTask ?? undefined}
            onClose={() => setModalOpen(false)}
            onSave={(task) => {
              const column = board.columns.find(
                (c) => c.id === selectedColumnId
              );
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
    </div>
  );
};

export default BoardDetailPage;
