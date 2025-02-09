import React from 'react';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
        <Calendar className="h-4 w-4 text-gray-400" />
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(dates) => {
            const [start, end] = dates;
            onChange({ startDate: start, endDate: end });
          }}
          className="w-full border-none focus:outline-none text-sm"
          placeholderText="Selecione o período..."
          dateFormat="dd/MM/yyyy"
          isClearable
          showPopperArrow={false}
          popperPlacement="bottom-start"
          popperClassName="date-range-popper"
          customInput={
            <input
              className="w-full border-none focus:outline-none text-sm"
              placeholder="Selecione o período..."
            />
          }
        />
      </div>
    </div>
  );
};
