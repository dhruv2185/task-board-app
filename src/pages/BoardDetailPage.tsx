// BoardDetailPage.tsx with modals and polished layout
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
import { v4 as uuid } from 'uuid';
import type { Task } from '../types';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';

const priorities = ['low', 'medium', 'high'] as const;

const BoardDetailPage: React.FC = () => {
  const { id } = useParams();
  const { boards, setBoards } = useBoard();
  const boardIndex = boards.findIndex((b) => b.id === id);
  const board = boards[boardIndex];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDueDate, setFilterDueDate] = useState('');

  const updateBoard = () => {
    const newBoards = [...boards];
    newBoards[boardIndex] = board;
    setBoards(newBoards);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, colId: string) => {
    const taskId = e.dataTransfer.getData('taskId');
    const fromColId = e.dataTransfer.getData('fromColId');
    if (!taskId || !fromColId || fromColId === colId) return;
    const fromCol = board.columns.find((c) => c.id === fromColId);
    const toCol = board.columns.find((c) => c.id === colId);
    if (!fromCol || !toCol) return;
    const taskIndex = fromCol.tasks.findIndex((t) => t.id === taskId);
    const [task] = fromCol.tasks.splice(taskIndex, 1);
    toCol.tasks.push(task);
    updateBoard();
  };

  const matchesFilter = (task: Task) => (
    (!search || task.title.includes(search) || task.description.includes(search)) &&
    (!filterPriority || task.priority === filterPriority) &&
    (!filterDueDate || task.dueDate === filterDueDate)
  );

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

  if (!board) return <div className="p-4">Board not found.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{board.title}</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input className="border p-2 rounded" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border p-2 rounded" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input className="border p-2 rounded" type="date" value={filterDueDate} onChange={(e) => setFilterDueDate(e.target.value)} />
      </div>

      <div className="flex gap-6 overflow-x-auto">
        {board.columns.map((col) => (
          <div
            key={col.id}
            className="min-w-[280px] bg-white rounded-xl shadow p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">{col.title}</h2>
              <button className="text-sm text-red-600" onClick={() => {
                board.columns = board.columns.filter(c => c.id !== col.id);
                updateBoard();
              }}>×</button>
            </div>
            {col.tasks.filter(matchesFilter).map((task) => (
              <div
                key={task.id}
                className="bg-gray-100 p-3 rounded mb-3 shadow-sm"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('taskId', task.id);
                  e.dataTransfer.setData('fromColId', col.id);
                }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm">{task.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded bg-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}-200`}>{task.priority}</span>
                </div>
                <p className="text-xs mt-1 text-gray-600">{task.description}</p>
                <p className="text-xs mt-1">By: {task.createdBy} • Due: {task.dueDate}</p>
                <div className="mt-2 text-xs text-right space-x-2">
                  <button onClick={() => openTaskModal(col.id, task)} className="text-blue-600">Edit</button>
                  <button onClick={() => deleteTask(col.id, task.id)} className="text-red-600">Delete</button>
                </div>
              </div>
            ))}
            <button onClick={() => openTaskModal(col.id)} className="text-blue-600 text-sm mt-2">+ Add Task</button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <TaskForm
          columnId={selectedColumnId!}
          existingTask={editingTask}
          onClose={() => setModalOpen(false)}
          onSave={(task: Task) => {
            const column = board.columns.find(c => c.id === selectedColumnId);
            if (!column) return;
            if (editingTask) {
              const index = column.tasks.findIndex(t => t.id === editingTask.id);
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
