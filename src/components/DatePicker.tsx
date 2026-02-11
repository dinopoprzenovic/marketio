"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function DatePicker({ selectedDate, onDateChange, minDate, maxDate }: DatePickerProps) {
  const today = startOfDay(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  const isToday = isSameDay(selectedDate, today);

  function handleTodayClick() {
    onDateChange(today);
    setShowCalendar(false);
  }

  function handleCalendarToggle() {
    setShowCalendar((prev) => !prev);
    setViewMonth(selectedDate.getMonth());
    setViewYear(selectedDate.getFullYear());
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function selectDay(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    onDateChange(date);
    setShowCalendar(false);
  }

  function isDayDisabled(day: number): boolean {
    const date = new Date(viewYear, viewMonth, day);
    if (minDate && date < startOfDay(minDate)) return true;
    if (maxDate && date > startOfDay(maxDate)) return true;
    return false;
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Convert Sunday=0 to Monday=0 format
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const formatSelected = selectedDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
        Start Date
      </p>

      {/* Quick options */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={handleTodayClick}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
            isToday
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-gray-700 shadow-sm"
          }`}
        >
          Start Today
        </button>
        <button
          onClick={handleCalendarToggle}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
            !isToday
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-gray-700 shadow-sm"
          }`}
        >
          <Calendar className="h-4 w-4" />
          {!isToday ? formatSelected : "Pick Date"}
        </button>
      </div>

      {/* Calendar dropdown */}
      {showCalendar && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
        >
          {/* Month navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {DAYS.map((d) => (
              <span key={d} className="py-1 text-center text-[10px] font-semibold uppercase text-gray-400">
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty cells for offset */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isSameDay(date, today);
              const disabled = isDayDisabled(day);
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={`flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : isCurrentDay
                        ? "bg-primary/10 text-primary"
                        : disabled
                          ? "text-gray-300"
                          : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Selected date display */}
      {!showCalendar && (
        <p className="text-xs text-gray-400">
          Vignette valid from: {formatSelected}
        </p>
      )}
    </div>
  );
}
