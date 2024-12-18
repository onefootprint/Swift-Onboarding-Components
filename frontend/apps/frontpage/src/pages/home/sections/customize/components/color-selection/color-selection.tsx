import { cx } from 'class-variance-authority';
import type React from 'react';
import FloatingCard from '../floating-card';

type Color = {
  name: string;
  hex: string;
};

type ColorSelectionProps = {
  title: string;
  activeHex: Color['hex'];
  colorList: Color[];
  className?: string;
  onChange: (value: Color['hex']) => void;
};

const ColorSelection: React.FC<ColorSelectionProps> = ({ onChange, title, colorList, activeHex, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleColorChange = (hex: Color['hex']) => {
    onChange(hex);
  };

  return (
    <FloatingCard className={className}>
      <p className="text-label-3">{title}</p>
      <div className="flex gap-1">
        {colorList.map(({ name, hex }) => (
          <div key={name} className="w-full">
            <input
              type="radio"
              id={`color-${name}`}
              name="color-selection"
              value={hex}
              onChange={handleChange}
              checked={activeHex === hex}
              className="hidden"
            />
            <button
              type="button"
              className={cx(
                'w-full rounded-sm overflow-hidden cursor-pointer h-8 transition-outline duration-75 ease-out box-content',
                {
                  'outline outline-2 -outline-offset-[5px] outline-[white]': activeHex === hex,
                },
              )}
              style={{ backgroundColor: hex }}
              onClick={() => handleColorChange(hex)}
              aria-label={`Change color to ${name}`}
            />
          </div>
        ))}
      </div>
    </FloatingCard>
  );
};

export default ColorSelection;
