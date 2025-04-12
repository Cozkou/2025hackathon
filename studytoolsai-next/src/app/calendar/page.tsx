'use client';

import { useState, useEffect, useRef } from 'react';
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
    
    // Add new state for free time slots
    const [freeSlots, setFreeSlots] = useState<Array<{start: string, end: string}>>([]);
    const [isCheckingFreeTime, setIsCheckingFreeTime] = useState(false);
    const [freeTimeError, setFreeTimeError] = useState<string | null>(null);
    
    // Add new state for slider values
    const [sliderStartValue, setSliderStartValue] = useState<number>(9);
    const [sliderEndValue, setSliderEndValue] = useState<number>(20);
    
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
    const handleCreateEvent = async () => {
        if (!selectedDate || !eventStartTime || !eventEndTime) return;
        
        try {
            // Format the date and time for the API request
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const startDateTime = `${formattedDate}T${eventStartTime}`;
            const endDateTime = `${formattedDate}T${eventEndTime}`;
            
            // Make API request to create the event
            const response = await fetch('/api/calendar/create-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    start: startDateTime,
                    end: endDateTime,
                    title: 'Revision Event',
                    description: 'Study session',
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create event');
            }
            
            const data = await response.json();
            
            if (data.success && data.event) {
                // Add the new event to the events state
                setEvents([...events, data.event]);
                setIsModalOpen(false);
            } else {
                throw new Error('Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            // You could add error handling UI here if needed
        }
    };
    
    // Check if a time slot is within the selected range
    const isInTimeRange = (timeSlot: string): boolean => {
        const hour = parseInt(timeSlot.split(':')[0]);
        if (startHour === null || endHour === null) return false;
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
    
    // Function to check free time slots
    const checkFreeTime = async () => {
        if (!selectedDate || startHour === null || endHour === null) return;

        try {
            setIsCheckingFreeTime(true);
            setFreeTimeError(null);

            // Format the date and time for the API request
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const startTimeFormatted = `${startHour.toString().padStart(2, '0')}:00`;
            const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:00`;

            // Make API request to our Next.js API route
            const response = await fetch('/api/calendar/free-slots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: formattedDate,
                    startTime: startTimeFormatted,
                    endTime: endTimeFormatted,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch free time slots');
            }

            const data = await response.json();
            
            if (data.freeSlots && Array.isArray(data.freeSlots)) {
                setFreeSlots(data.freeSlots);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error checking free time:', error);
            setFreeTimeError(error instanceof Error ? error.message : 'Failed to check free time');
            setFreeSlots([]);
        } finally {
            setIsCheckingFreeTime(false);
        }
    };
    
    // Add test function to manually set free slots
    const testSetFreeSlots = (mockData: Array<{start: string, end: string}>) => {
        setFreeSlots(mockData);
    };

    // Add to useEffect for testing - you can remove this later
    useEffect(() => {
        // Expose the test function to the window object for testing
        (window as any).testSetFreeSlots = testSetFreeSlots;
    }, []);

    // Add helper function to check if a time slot is within any free slot
    const isTimeSlotFree = (timeSlot: string): boolean => {
        return freeSlots.some(freeSlot => {
            const slotHour = parseInt(timeSlot.split(':')[0]);
            const freeStartHour = parseInt(freeSlot.start.split(':')[0]);
            const freeEndHour = parseInt(freeSlot.end.split(':')[0]);
            return slotHour >= freeStartHour && slotHour < freeEndHour;
        });
    };

    // Add helper function to get the full free slot for a time
    const getFreeSlotForTime = (timeSlot: string) => {
        return freeSlots.find(freeSlot => {
            const slotHour = parseInt(timeSlot.split(':')[0]);
            const freeStartHour = parseInt(freeSlot.start.split(':')[0]);
            const freeEndHour = parseInt(freeSlot.end.split(':')[0]);
            return slotHour >= freeStartHour && slotHour < freeEndHour;
        });
    };

    // Update start/end hours when slider values change
    useEffect(() => {
        setStartHour(sliderStartValue);
        setEndHour(sliderEndValue);
    }, [sliderStartValue, sliderEndValue]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529] flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8">Study Time Planner</h1>
                    
                    {/* Date Selection */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-[#8B7FFF]/20 p-6 mb-6">
                        <h2 className="text-xl font-medium text-white mb-4">Select a Date</h2>
                        <div className="grid grid-cols-7 gap-3">
                            {nextDays.map((day, index) => (
                                <button
                                    key={index}
                                    className={`p-4 rounded-xl text-center transition-all ${
                                        selectedDate && 
                                        day.getDate() === selectedDate.getDate() && 
                                        day.getMonth() === selectedDate.getMonth() && 
                                        day.getFullYear() === selectedDate.getFullYear()
                                            ? 'bg-[#86efac]/20 text-[#86efac] border-2 border-[#86efac]'
                                            : 'bg-black/20 text-white border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40'
                                    }`}
                                    onClick={() => handleDaySelect(day)}
                                >
                                    <div className="text-sm font-medium mb-1">
                                        {day.toLocaleDateString('default', { weekday: 'short' })}
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {day.getDate()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedDate && (
                        <>
                            {/* Time Range Selection */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-[#8B7FFF]/20 p-6 mb-6">
                                <h2 className="text-xl font-medium text-white mb-4">Set Available Hours</h2>
                                
                                <div className="flex flex-col items-center">
                                    <div className="w-full max-w-md mb-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Start Time */}
                                            <div>
                                                <label className="block text-white mb-2">Start Time</label>
                                                <div className="relative group">
                                                    <select
                                                        className="w-full p-3 rounded-lg bg-[#141529]/80 text-white border border-[#8B7FFF]/30 appearance-none transition-all group-hover:border-[#8B7FFF]/60 focus:border-[#86efac]/70 focus:ring-1 focus:ring-[#86efac]/50 outline-none backdrop-blur-sm"
                                                        value={sliderStartValue}
                                                        onChange={(e) => {
                                                            const newValue = parseInt(e.target.value);
                                                            if (newValue < sliderEndValue) {
                                                                setSliderStartValue(newValue);
                                                            }
                                                        }}
                                                    >
                                                        {Array.from({ length: 24 }, (_, i) => (
                                                            <option 
                                                                key={i} 
                                                                value={i}
                                                                disabled={i >= sliderEndValue}
                                                                className="bg-[#141529] text-white"
                                                            >
                                                                {i.toString().padStart(2, '0')}:00
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#8B7FFF] group-hover:text-[#86efac] transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* End Time */}
                                            <div>
                                                <label className="block text-white mb-2">End Time</label>
                                                <div className="relative group">
                                                    <select
                                                        className="w-full p-3 rounded-lg bg-[#141529]/80 text-white border border-[#8B7FFF]/30 appearance-none transition-all group-hover:border-[#8B7FFF]/60 focus:border-[#86efac]/70 focus:ring-1 focus:ring-[#86efac]/50 outline-none backdrop-blur-sm"
                                                        value={sliderEndValue}
                                                        onChange={(e) => {
                                                            const newValue = parseInt(e.target.value);
                                                            if (newValue > sliderStartValue) {
                                                                setSliderEndValue(newValue);
                                                            }
                                                        }}
                                                    >
                                                        {Array.from({ length: 24 }, (_, i) => (
                                                            <option 
                                                                key={i} 
                                                                value={i}
                                                                disabled={i <= sliderStartValue}
                                                                className="bg-[#141529] text-white"
                                                            >
                                                                {i.toString().padStart(2, '0')}:00
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#8B7FFF] group-hover:text-[#86efac] transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 p-4 rounded-lg bg-[#86efac]/10 border border-[#86efac]/20">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[#86efac] text-lg font-medium">
                                                    {sliderStartValue.toString().padStart(2, '0')}:00 - {sliderEndValue.toString().padStart(2, '0')}:00
                                                </div>
                                                <div className="text-[#86efac]/70 text-sm">
                                                    {sliderEndValue - sliderStartValue} hours
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end space-x-4 w-full max-w-md mt-6">
                                        <button
                                            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-colors"
                                            onClick={() => {
                                                setSliderStartValue(9);
                                                setSliderEndValue(20);
                                            }}
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={checkFreeTime}
                                            disabled={isCheckingFreeTime}
                                            className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                                                isCheckingFreeTime
                                                    ? 'bg-[#8B7FFF]/20 text-white/50 cursor-not-allowed'
                                                    : 'bg-[#86efac]/20 text-[#86efac] border border-[#86efac] hover:bg-[#86efac]/30'
                                            }`}
                                        >
                                            {isCheckingFreeTime ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-t-transparent border-[#86efac] rounded-full animate-spin"></div>
                                                    <span>Checking...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <span>Find Free Time</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Free Time Slots */}
                            {(freeSlots.length > 0 || freeTimeError) && (
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-[#8B7FFF]/20 p-6">
                                    <h2 className="text-xl font-medium text-white mb-4">Available Time Slots</h2>

                                    {freeTimeError ? (
                                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{freeTimeError}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {freeSlots.map((slot, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 rounded-lg bg-[#86efac]/10 border border-[#86efac]/20 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-2 h-8 bg-[#86efac] rounded-full"></div>
                                                        <div>
                                                            <div className="text-[#86efac] text-lg font-medium">
                                                                {slot.start} - {slot.end}
                                                            </div>
                                                            <div className="text-[#86efac]/70 text-sm">
                                                                {formatDate(selectedDate)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="px-4 py-2 rounded-lg bg-[#86efac]/20 text-[#86efac] border border-[#86efac] hover:bg-[#86efac]/30"
                                                        onClick={() => {
                                                            setEventStartTime(slot.start);
                                                            setEventEndTime(slot.end);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        Schedule
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Add Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#141529] rounded-xl p-6 w-full max-w-md mx-4">
                        <h2 className="text-2xl font-bold text-white mb-6">Schedule Study Session</h2>
                        
                        <div className="mb-6">
                            <div className="p-4 rounded-lg bg-[#86efac]/10 border border-[#86efac]/20">
                                <div className="text-[#86efac] text-lg font-medium mb-1">
                                    {eventStartTime} - {eventEndTime}
                                </div>
                                <div className="text-[#86efac]/70">
                                    {selectedDate ? formatDate(selectedDate) : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-4">
                            <button 
                                className="px-6 py-3 rounded-lg bg-black/20 text-white hover:bg-black/30"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-6 py-3 rounded-lg bg-[#86efac]/20 text-[#86efac] border border-[#86efac] hover:bg-[#86efac]/30"
                                onClick={handleCreateEvent}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
