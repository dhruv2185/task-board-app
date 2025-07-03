import { useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useBoard } from "../context/BoardContext";
import { PencilIcon, PlusIcon, EyeIcon } from "@heroicons/react/24/outline";

const BoardListPage: React.FC = () => {
  const { boards, setBoards } = useBoard();
  const [title, setTitle] = useState("");

  const createBoard = () => {
    if (!title.trim()) return;
    setBoards([...boards, { id: uuid(), title, columns: [] }]);
    setTitle("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          Boards
        </h1>

        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative flex-1 w-full">
              <label
                htmlFor="boardTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Board
              </label>
              <PencilIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
              <input
                id="boardTitle"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                placeholder="Enter board title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <button
              onClick={createBoard}
              className="self-start sm:self-end bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create Board
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">Title</th>
                <th className="p-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boards.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="p-3 text-center text-gray-500 text-sm font-medium"
                  >
                    No boards available. Create one to get started!
                  </td>
                </tr>
              ) : (
                boards.map((board) => (
                  <tr
                    key={board.id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-sm text-gray-800">{board.title}</td>
                    <td className="p-3">
                      <Link
                        to={`/board/${board.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <EyeIcon className="h-5 w-5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BoardListPage;
