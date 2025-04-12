import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime } = body;

    // Validate required fields
    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { message: 'Missing required fields: date, startTime, endTime' },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await fetch('http://localhost:8000/calendar/free', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        start_time: startTime,
        end_time: endTime,
        constraints: [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.detail || 'Failed to fetch free time slots' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Parse the JSON string response from the backend
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
    // Check if the response has the expected format
    if (!parsedData.success) {
      return NextResponse.json(
        { message: parsedData.error || 'Failed to fetch free time slots' },
        { status: 400 }
      );
    }

    // Return the free slots in a format expected by the frontend
    return NextResponse.json({
      freeSlots: parsedData.free_slots || [],
    });
  } catch (error) {
    console.error('Error in free-slots API route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 