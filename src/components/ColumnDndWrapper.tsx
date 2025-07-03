
import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Column {
  id: string;
  title: string;
  tasks: any[];
}

interface Props {
  columns: Column[];
  renderColumn: (column: Column) => React.ReactNode;
  onReorder: (newCols: Column[]) => void;
}

export default function ColumnDndWrapper({ columns, renderColumn, onReorder }: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = columns.findIndex(c => c.id === active.id);
    const newIndex = columns.findIndex(c => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(columns, oldIndex, newIndex);
    onReorder(reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
        {columns.map(col => (
          <SortableColumn key={col.id} id={col.id}>
            {renderColumn(col)}
          </SortableColumn>
        ))}
      </SortableContext>
    </DndContext>
  );
}

interface SortableProps {
  id: string;
  children: React.ReactNode;
}

function SortableColumn({ id, children }: SortableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
