import { Button } from 'flowbite-react';
import Select from 'react-select';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Bars3Icon, TrashIcon } from '@heroicons/react/24/solid';
import { SelectedTag } from '@codewit/interfaces';
import { SelectStyles } from '../../utils/styles';

interface ResourceSelectProps {
  resourceOptions: SelectedTag[];
  selectedResourceIds: number[];
  onAddResource: (resourceId: number) => void;
  onMoveResource: (fromIndex: number, toIndex: number) => void;
  onRemoveResource: (resourceId: number) => void;
}

interface SortableResourceProps {
  resource: SelectedTag;
  onRemove: () => void;
}

function SortableResource({ resource, onRemove }: SortableResourceProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: resource.value,
  });

  return (
    <div
      ref={setNodeRef}
      className="border rounded-lg p-2 gap-x-2 flex flex-row items-center bg-[rgb(55,65,81)] border-[rgb(75,85,99)]"
      style={{
        transform: transform != null
          ? `translate3d(0, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
          : '',
        transition,
      }}
    >
      <button
        type="button"
        className="p-2 text-white cursor-grab"
        aria-label={`Drag ${resource.label}`}
        {...attributes}
        {...listeners}
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <p className="flex-1 truncate text-white">{resource.label}</p>
      <Button
        type="button"
        color="red"
        aria-label={`Remove ${resource.label}`}
        onClick={onRemove}
      >
        <TrashIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}

const ResourceSelect = ({
  resourceOptions,
  selectedResourceIds,
  onAddResource,
  onMoveResource,
  onRemoveResource,
}: ResourceSelectProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const selectedResources = selectedResourceIds
    .map(resourceId => resourceOptions.find(option => option.value === resourceId))
    .filter((resource): resource is SelectedTag => resource != null);
  const availableResources = resourceOptions.filter(
    option => !selectedResourceIds.includes(option.value),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over == null || active.id === over.id) {
      return;
    }

    const fromIndex = selectedResourceIds.indexOf(Number(active.id));
    const toIndex = selectedResourceIds.indexOf(Number(over.id));

    if (fromIndex >= 0 && toIndex >= 0) {
      onMoveResource(fromIndex, toIndex);
    }
  };

  return (
    <div className="space-y-2 w-full" data-testid="resource-select">
      <label htmlFor="resource-select" className="block text-sm font-medium text-gray-400">
        Resources
      </label>
      <Select
        id="resource-select"
        value={null}
        onChange={option => {
          if (option != null) {
            onAddResource(option.value);
          }
        }}
        options={availableResources}
        isSearchable
        placeholder="Search resources"
        styles={SelectStyles}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={selectedResourceIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2" data-testid="selected-resources">
            {selectedResources.map(resource => (
              <SortableResource
                key={resource.value}
                resource={resource}
                onRemove={() => onRemoveResource(resource.value)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ResourceSelect;
