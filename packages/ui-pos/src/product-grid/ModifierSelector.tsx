import { ModifierGroup, ModifierOption } from '../types';
import { useState } from 'react';

interface ModifierSelectorProps {
  groups: ModifierGroup[];
  onChange: (selections: Record<string, string[]>) => void;
}

export function ModifierSelector({ groups, onChange }: ModifierSelectorProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    groups.forEach((g) => {
      const defaults = g.options.filter((o) => o.default).map((o) => o.id);
      if (defaults.length) initial[g.id] = defaults;
    });
    return initial;
  });

  const toggle = (groupId: string, optionId: string, maxSelections: number) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      let next: string[];
      if (maxSelections === 1) {
        next = [optionId];
      } else if (current.includes(optionId)) {
        next = current.filter((id) => id !== optionId);
      } else if (current.length < maxSelections) {
        next = [...current, optionId];
      } else {
        return prev;
      }
      const updated = { ...prev, [groupId]: next };
      onChange(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold">{group.name}</span>
            {group.required && <span className="text-xs text-red-500">Required</span>}
            {group.maxSelections > 1 && (
              <span className="text-xs text-gray-400">Pick up to {group.maxSelections}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option: ModifierOption) => {
              const isSelected = (selections[group.id] || []).includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggle(group.id, option.id, group.maxSelections)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.name}
                  {option.price > 0 && <span className="ml-1 text-gray-400">+${option.price.toFixed(2)}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
