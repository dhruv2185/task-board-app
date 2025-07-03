# 🧩 Task Board Application

A fully functional, visually organized task board application built with **React**, **TypeScript**, and **Drag-and-Drop (DnD Kit)**. Easily manage tasks across columns like **To Do**, **In Progress**, and **Done** with a clean, interactive UI.

## 🚀 Features

### 🗂️ Board View
- Create new boards
- View all boards in a tabular list
- Click a board to view its details

### 📋 Board Detail Page
- Add/edit/delete **columns** (like “To Do”, “In Progress”)
- Add/edit/delete **tasks** with:
  - Title, description, due date, creator name
  - Priority tags: High, Medium, Low
- Move tasks **between columns**
- Reorder tasks **within the same column**
- Drag overlay so dragged tasks don’t disappear
- Empty column drop zones for clean UX
- Filter and search tasks by title, description, priority, or due date

---

## 🛠️ Tech Stack

- **React** with **TypeScript**
- **TailwindCSS** for styling
- **@dnd-kit** for drag-and-drop
- **Context API** for state management
- **LocalStorage** to persist data

---

## 🧑‍💻 Installation & Setup

```bash
git clone https://github.com/your-username/task-board-app.git
cd task-board-app

# Install dependencies
npm install

# Run the app
npm run dev
```

> Make sure you’re using Node.js version ≥ 16

---

## 🧠 Project Structure

```
src/
├── components/
│   ├── BoardTable.tsx
│   ├── BoardDetailPage.tsx
│   ├── ColumnModal.tsx
│   ├── TaskCard.tsx
├── context/
│   └── BoardContext.tsx
├── types/
│   └── index.ts
├── utils/
│   └── localStorage.ts
└── App.tsx
```

---

## ✅ To-Do / Improvements

- [ ] Add user authentication
- [ ] Enable export/import of boards
- [ ] Add animations for drag/drop
- [ ] Improve mobile responsiveness

---

## 📄 License

This project is open-source and free to use under the MIT License.

---

## 🙌 Acknowledgements

- [`@dnd-kit`](https://github.com/clauderic/dnd-kit)
- [TailwindCSS](https://tailwindcss.com/)

---

> Designed and built with ❤️ by Dhruv Ghevariya