import React, { useState } from 'react';
import type { Scene } from '../types';
import { TransitionSelector } from './TransitionSelector';

interface SceneEditorProps {
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  isDisabled: boolean;
}

const SceneItem: React.FC<{
    scene: Scene;
    onUpdate: (id: string, updates: Partial<Pick<Scene, 'prompt' | 'duration'>>) => void;
    onRemove: (id: string) => void;
    isDisabled: boolean;
    index: number;
    isDraggable: boolean;
}> = ({ scene, onUpdate, onRemove, isDisabled, index, isDraggable }) => {
    return (
        <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
                 <div className="flex items-center space-x-2 text-gray-300">
                    {isDraggable && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-grab" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    )}
                    <label htmlFor={`prompt-${scene.id}`} className="block text-sm font-medium">
                        Cảnh {index + 1}
                    </label>
                 </div>
                <button
                    onClick={() => onRemove(scene.id)}
                    disabled={isDisabled || !isDraggable}
                    className="text-red-400 hover:text-red-300 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    XÓA
                </button>
            </div>
            <textarea
                id={`prompt-${scene.id}`}
                rows={3}
                value={scene.prompt}
                onChange={(e) => onUpdate(scene.id, { prompt: e.target.value })}
                disabled={isDisabled}
                placeholder="Mô tả cảnh này..."
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none disabled:opacity-50"
            />
             <div className="flex items-center space-x-4">
                <input
                    id={`duration-${scene.id}`}
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={scene.duration}
                    onChange={(e) => onUpdate(scene.id, { duration: parseInt(e.target.value, 10) })}
                    disabled={isDisabled}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <span className="w-12 text-center bg-gray-700 text-white text-sm font-medium px-2.5 py-1 rounded-lg">
                    {scene.duration}s
                </span>
            </div>
        </div>
    );
};


export const SceneEditor: React.FC<SceneEditorProps> = ({ scenes, setScenes, isDisabled }) => {
  const [draggedItem, setDraggedItem] = useState<Scene | null>(null);

  const handleAddScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}-${Math.random()}`,
      prompt: '',
      duration: 5,
      transition: 'Fade in',
    };
    setScenes(prev => [...prev, newScene]);
  };
  
  const handleRemoveScene = (id: string) => {
    if (scenes.length > 1) {
        setScenes(prev => prev.filter(scene => scene.id !== id));
    }
  };

  const handleUpdateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(scene => 
        scene.id === id ? { ...scene, ...updates } : scene
    ));
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, scene: Scene) => {
    if (scenes.length <= 1) return;
    setDraggedItem(scene);
    // Use a timeout to allow the browser to render the drag image before hiding the element
    setTimeout(() => {
        e.currentTarget.style.visibility = 'hidden';
    }, 0);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    const draggedOverItem = scenes[index];
    if (draggedItem.id === draggedOverItem.id) {
      return;
    }
    const items = scenes.filter(item => item.id !== draggedItem.id);
    items.splice(index, 0, draggedItem);
    setScenes(items);
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.visibility = 'visible';
    setDraggedItem(null);
  };
  
  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Trình soạn thảo kịch bản</h2>
            <span className="text-sm text-gray-400">Tổng thời lượng: {totalDuration} giây</span>
        </div>
        <div>
        {scenes.map((scene, index) => (
            <React.Fragment key={scene.id}>
                {index > 0 && (
                    <TransitionSelector
                        transition={scene.transition || 'None'}
                        onChange={(newTransition) => handleUpdateScene(scene.id, { transition: newTransition })}
                        isDisabled={isDisabled}
                    />
                )}
                <div
                    draggable={!isDisabled && scenes.length > 1}
                    onDragStart={(e) => onDragStart(e, scene)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDragEnd={onDragEnd}
                    className={scenes.length > 1 ? 'transition-transform' : ''}
                >
                    <SceneItem 
                        scene={scene}
                        onUpdate={handleUpdateScene}
                        onRemove={handleRemoveScene}
                        isDisabled={isDisabled}
                        index={index}
                        isDraggable={scenes.length > 1}
                    />
                </div>
            </React.Fragment>
        ))}
      </div>
      <button
        onClick={handleAddScene}
        disabled={isDisabled}
        className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        + Thêm cảnh
      </button>
    </div>
  );
};