'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Share2, MoreHorizontal } from 'lucide-react'
import { cn } from "@/lib/utils"
import { format, addMonths, subMonths, startOfWeek, endOfWeek, isSameDay, isToday, parseISO, addDays } from 'date-fns'

export default function DailyNotes() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [notes, setNotes] = useState<{ [key: string]: string }>({})
  const mainContentRef = useRef<HTMLDivElement>(null) // Ref for the main content area

  // Load notes from localStorage on initial render
  useEffect(() => {
    const storedNotes = localStorage.getItem('dailyNotes')
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes))
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dailyNotes', JSON.stringify(notes))
  }, [notes])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = []
    let day = new Date(year, month, 1)

    while (day.getMonth() === month) {
      days.push(new Date(day))
      day.setDate(day.getDate() + 1)
    }
    return days
  }

  const daysInCurrentMonth = useMemo(() => getDaysInMonth(currentMonth), [currentMonth])

  const handleNoteChange = (dateKey: string, content: string) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [dateKey]: content,
    }))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1))
    } else {
      setCurrentMonth(addMonths(currentMonth, 1))
    }
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    // Scroll to today's date if it's in the current month view
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    setTimeout(() => { // Use a timeout to ensure DOM is updated
      const element = document.getElementById(todayKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  }

  // Calculate the week to display in the header
  const startDayOfCurrentWeek = startOfWeek(currentMonth, { weekStartsOn: 1 }) // Monday
  const daysOfWeekHeader = Array.from({ length: 7 }).map((_, i) => addDays(startDayOfCurrentWeek, i))

  const handleDayClickInHeader = (date: Date) => {
    setCurrentMonth(date); // Update the current month/day
    const dateKey = format(date, 'yyyy-MM-dd');
    setTimeout(() => { // Use a timeout to ensure DOM is updated after state change
      const element = document.getElementById(dateKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 md:gap-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800 hover:text-white" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            {daysOfWeekHeader.map((day, index) => (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "flex flex-col h-auto py-2 px-3 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white",
                  isSameDay(day, currentMonth) && "bg-zinc-700 text-white hover:bg-zinc-600",
                  isToday(day) && "border border-blue-500" // Highlight today
                )}
                onClick={() => handleDayClickInHeader(day)}
              >
                <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                <span className="text-sm font-semibold">{format(day, 'd')}</span>
              </Button>
            ))}
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800 hover:text-white" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-zinc-400 hover:bg-zinc-800 hover:text-white" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <CalendarDays className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="text-zinc-400 hover:bg-zinc-800 hover:text-white">
            Share
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main ref={mainContentRef} className="max-w-3xl mx-auto">
        {daysInCurrentMonth.map((date, index) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          const noteContent = notes[dateKey] || ''

          return (
            <div key={dateKey} id={dateKey} className="mb-12 pt-4"> {/* Added id and padding-top for scroll offset */}
              <h2 className="text-4xl font-bold mb-6">{format(date, 'MMMM do, yyyy')}</h2>
              <div className="flex items-start gap-2 text-zinc-400">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800 hover:text-white">
                  <Plus className="h-5 w-5" />
                </Button>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="flex-1 outline-none focus:outline-none border-b border-transparent focus:border-zinc-700 pb-1 text-lg font-medium whitespace-pre-wrap break-words" // Removed min-h, added whitespace-pre-wrap and break-words
                  data-placeholder="Type / for options"
                  onInput={(e) => handleNoteChange(dateKey, e.currentTarget.textContent || '')}
                  dangerouslySetInnerHTML={{ __html: noteContent }}
                />
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
