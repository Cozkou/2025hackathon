import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start, end, title = 'Revision Event', description = '' } = body;

    // Validate required fields
    if (!start || !end) {
      return NextResponse.json(
        { message: 'Missing required fields: start, end' },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await fetch('http://backend:8000/calendar/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start,
        end,
        summary: title,
        description,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.detail || 'Failed to create event' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Check if the response has the expected format
    if (!data.success) {
      return NextResponse.json(
        { message: data.error || 'Failed to create event' },
        { status: 400 }
      );
    }

    // Return the created event data
    return NextResponse.json({
      success: true,
      event: {
        id: Date.now().toString(), // Generate a temporary ID
        title,
        startTime: start,
        endTime: end,
        date: new Date(start.split('T')[0]),
      },
    });
  } catch (error) {
    console.error('Error in create-event API route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 