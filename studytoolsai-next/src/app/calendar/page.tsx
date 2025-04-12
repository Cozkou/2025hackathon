'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Define the Event type
interface Event {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    date: Date;
}

export default function Calendar() {
    // State for selected day and time range
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [startHour, setStartHour] = useState<number | null>(9); // Default 9 AM
    const [endHour, setEndHour] = useState<number | null>(20); // Default 8 PM
    
    // State for events
    const [events, setEvents] = useState<Event[]>([]);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventStartTime, setEventStartTime] = useState<string>('');
    const [eventEndTime, setEventEndTime] = useState<string>('');
    
    // Time selection state
    const [isSelectingStart, setIsSelectingStart] = useState<boolean>(true);
    
    // Initialize with today's date
    useEffect(() => {
        setSelectedDate(new Date());
    }, []);
    
    // Generate time slots for the selected day
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        return `${hour.toString().padStart(2, '0')}:00`;
    });
    
    // Generate filtered time slots based on selected range
    const filteredTimeSlots = timeSlots.filter(timeSlot => {
        const hour = parseInt(timeSlot.split(':')[0]);
        if (startHour === null || endHour === null) return false;
        return hour >= startHour && hour < endHour;
    });
    
    // Format date for display
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' });
    };
    
    // Handle day selection
    const handleDaySelect = (date: Date) => {
        setSelectedDate(date);
    };
    
    // Handle time range selection
    const handleTimeRangeChange = (start: number | null, end: number | null) => {
        if (start !== null && end !== null) {
            setStartHour(start);
            setEndHour(end);
        }
    };
    
    // Handle opening the modal for adding a new event
    const handleAddEvent = (timeSlot: string) => {
        if (!selectedDate) return;
        
        // Set default start time to the clicked time slot
        setEventStartTime(timeSlot);
        
        // Set default end time to one hour later
        const hour = parseInt(timeSlot.split(':')[0]);
        const nextHour = (hour + 1) % 24;
        const nextHourFormatted = nextHour.toString().padStart(2, '0') + ':00';
        setEventEndTime(nextHourFormatted);
        
        setIsModalOpen(true);
    };
    
    // Handle creating a new event
    const handleCreateEvent = () => {
        if (!selectedDate || !eventStartTime || !eventEndTime) return;
        
        const newEvent: Event = {
            id: Date.now().toString(),
            title: 'Revision Session',
            startTime: eventStartTime,
            endTime: eventEndTime,
            date: selectedDate
        };
        
        setEvents([...events, newEvent]);
        setIsModalOpen(false);
        
        // TODO: Sync with Google Calendar
        // syncWithGoogleCalendar(newEvent);
    };
    
    // Check if a time slot is within the selected range
    const isInTimeRange = (timeSlot: string): boolean => {
        const hour = parseInt(timeSlot.split(':')[0]);
        return hour >= startHour && hour < endHour;
    };
    
    // Check if a time slot has an event
    const hasEvent = (timeSlot: string): boolean => {
        return events.some(event => 
            event.date.getTime() === selectedDate?.getTime() &&
            isTimeSlotInEventRange(timeSlot, event)
        );
    };
    
    // Check if a time slot falls within an event's time range
    const isTimeSlotInEventRange = (timeSlot: string, event: Event): boolean => {
        const slotHour = parseInt(timeSlot.split(':')[0]);
        const startHour = parseInt(event.startTime.split(':')[0]);
        const endHour = parseInt(event.endTime.split(':')[0]);
        
        return slotHour >= startHour && slotHour < endHour;
    };
    
    // Get event for a time slot
    const getEventForTimeSlot = (timeSlot: string): Event | undefined => {
        return events.find(event => 
            event.date.getTime() === selectedDate?.getTime() &&
            isTimeSlotInEventRange(timeSlot, event)
        );
    };
    
    // Generate days for the next 7 days
    const getNextDays = (): Date[] => {
        const days: Date[] = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() + i);
            days.push(day);
        }
        
        return days;
    };
    
    const nextDays = getNextDays();
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529] flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 pt-30 pb-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-[#8B7FFF]/20 p-6">
                    <h1 className="text-2xl font-bold text-white mb-6">Study Planner</h1>
                    
                    {/* Day Selection */}
                    <div className="mb-8">
                        <h2 className="text-lg font-medium text-white mb-4">Select a Day</h2>
                        <div className="grid grid-cols-7 gap-2">
                            {nextDays.map((day, index) => (
                                <button
                                    key={index}
                                    className={`p-3 rounded-lg text-center ${
                                        selectedDate && 
                                        day.getDate() === selectedDate.getDate() && 
                                        day.getMonth() === selectedDate.getMonth() && 
                                        day.getFullYear() === selectedDate.getFullYear()
                                            ? 'bg-[#86efac]/20 text-[#86efac] border border-[#86efac]'
                                            : 'bg-black/20 text-white border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40'
                                    }`}
                                    onClick={() => handleDaySelect(day)}
                                >
                                    <div className="text-sm font-medium">
                                        {day.toLocaleDateString('default', { weekday: 'short' })}
                                    </div>
                                    <div className="text-lg">
                                        {day.getDate()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Time Range Selection */}
                    {selectedDate && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-white">Select Time Range</h2>
                                <div className="text-white">
                                    {startHour !== null && endHour !== null ? (
                                        `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`
                                    ) : (
                                        'No time range selected'
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-black/20 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${isSelectingStart ? 'bg-[#86efac]' : 'bg-[#8B7FFF]'}`}></div>
                                        <span className="text-white">
                                            {isSelectingStart ? 'Select Start Time' : 'Select End Time'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-6 gap-2">
                                    {Array.from({ length: 24 }, (_, i) => {
                                        const hour = i;
                                        const isSelected = isSelectingStart 
                                            ? hour === startHour 
                                            : hour === endHour;
                                        const isInRange = startHour !== null && endHour !== null && hour >= startHour && hour <= endHour;
                                        const isDisabled = startHour !== null && endHour !== null && (
                                            isSelectingStart 
                                                ? hour > (endHour ?? 23)
                                                : hour < (startHour ?? 0)
                                        );
                                        
                                        return (
                                            <button
                                                key={hour}
                                                className={`p-2 rounded-lg text-center ${
                                                    isSelected
                                                        ? 'bg-[#86efac]/20 text-[#86efac] border border-[#86efac]'
                                                        : isInRange
                                                            ? 'bg-[#8B7FFF]/20 text-white border border-[#8B7FFF]/40'
                                                            : 'bg-black/20 text-white/70 border border-[#8B7FFF]/20'
                                                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    
                                                    if (isSelectingStart) {
                                                        setStartHour(hour);
                                                        setIsSelectingStart(false);
                                                    } else {
                                                        setEndHour(hour);
                                                        setIsSelectingStart(true);
                                                    }
                                                }}
                                                disabled={isDisabled}
                                            >
                                                {hour.toString().padStart(2, '0')}:00
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                                    onClick={() => {
                                        setStartHour(null);
                                        setEndHour(null);
                                        setIsSelectingStart(true);
                                    }}
                                >
                                    Clear Selection
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-[#8B7FFF]/20 text-white border border-[#8B7FFF]/40 hover:bg-[#8B7FFF]/30"
                                    onClick={() => setIsSelectingStart(!isSelectingStart)}
                                >
                                    {isSelectingStart ? 'Switch to End Time' : 'Switch to Start Time'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Time Slots Visualization */}
                    {selectedDate && startHour !== null && endHour !== null && (
                        <div className="mb-8">
                            <h2 className="text-lg font-medium text-white mb-4">
                                {formatDate(selectedDate)} - Schedule
                            </h2>
                            <div className="bg-black/20 rounded-lg p-4">
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredTimeSlots.map((timeSlot) => {
                                        const event = getEventForTimeSlot(timeSlot);
                                        
                                        return (
                                            <div 
                                                key={timeSlot}
                                                className={`p-2 rounded-lg ${
                                                    event
                                                        ? 'bg-gray-800/50 border border-gray-700 text-gray-400'
                                                        : 'bg-[#8B7FFF]/10 border border-[#8B7FFF]/20'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="text-white">{timeSlot}</div>
                                                    {!hasEvent(timeSlot) && (
                                                        <button
                                                            className="text-xs px-2 py-1 rounded bg-[#86efac]/20 text-[#86efac] border border-[#86efac] hover:bg-[#86efac]/30"
                                                            onClick={() => handleAddEvent(timeSlot)}
                                                        >
                                                            Add Event
                                                        </button>
                                                    )}
                                                    {hasEvent(timeSlot) && (
                                                        <div className="text-xs text-gray-400">
                                                            {getEventForTimeSlot(timeSlot)?.startTime} - {getEventForTimeSlot(timeSlot)?.endTime}
                                                        </div>
                                                    )}
                                                </div>
                                                {hasEvent(timeSlot) && (
                                                    <div className="mt-1 text-sm text-gray-400">
                                                        {getEventForTimeSlot(timeSlot)?.title}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#141529] rounded-xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold text-white mb-4">Add Revision Session</h2>
                        
                        <div className="mb-4">
                            <p className="text-[#B39DDB]/70 mb-2">
                                Date: {selectedDate ? formatDate(selectedDate) : ''}
                            </p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-white mb-1">Start Time</label>
                            <div className="grid grid-cols-4 gap-2">
                                {filteredTimeSlots.map((time) => {
                                    const isSelected = time === eventStartTime;
                                    return (
                                        <button
                                            key={time}
                                            className={`p-2 rounded-lg text-center ${
                                                isSelected
                                                    ? 'bg-[#86efac]/20 text-[#86efac] border border-[#86efac]'
                                                    : 'bg-black/20 text-white border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40'
                                            }`}
                                            onClick={() => setEventStartTime(time)}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-white mb-1">End Time</label>
                            <div className="grid grid-cols-4 gap-2">
                                {filteredTimeSlots.map((time) => {
                                    const isSelected = time === eventEndTime;
                                    const isDisabled = parseInt(time.split(':')[0]) <= parseInt(eventStartTime.split(':')[0]);
                                    
                                    return (
                                        <button
                                            key={time}
                                            className={`p-2 rounded-lg text-center ${
                                                isSelected
                                                    ? 'bg-[#86efac]/20 text-[#86efac] border border-[#86efac]'
                                                    : isDisabled
                                                        ? 'bg-black/20 text-white/50 border border-[#8B7FFF]/10 cursor-not-allowed'
                                                        : 'bg-black/20 text-white border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40'
                                            }`}
                                            onClick={() => !isDisabled && setEventEndTime(time)}
                                            disabled={isDisabled}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button 
                                className="px-4 py-2 rounded-lg bg-black/20 text-white"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 rounded-lg bg-[#86efac]/20 text-[#86efac]"
                                onClick={handleCreateEvent}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
