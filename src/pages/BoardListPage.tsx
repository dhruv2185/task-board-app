import { useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useBoard } from "../context/BoardContext";

const BoardListPage: React.FC = () => {
  const { boards, setBoards } = useBoard();
  const [title, setTitle] = useState("");

  const createBoard = () => {
    if (!title.trim()) return;
    setBoards([...boards, { id: uuid(), title, columns: [] }]);
    setTitle("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Boards</h1>
      <div className="mb-4">
        <input
          className="border p-2 mr-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Board title"
        />
        <button
          onClick={createBoard}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Title</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {boards.map((board) => (
            <tr key={board.id} className="border-t">
              <td className="p-2">{board.title}</td>
              <td className="p-2">
                <Link
                  to={`/board/${board.id}`}
                  className="text-blue-600 underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default BoardListPage;
