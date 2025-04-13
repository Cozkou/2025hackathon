import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, email } = body;

    console.log('API route received request:', { date, startTime, endTime, email });

    // Validate required fields
    if (!date || !startTime || !endTime || !email) {
      return NextResponse.json(
        { message: 'Missing required fields: date, startTime, endTime, email' },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await fetch('http://backend:8000/calendar/free', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        start_time: startTime,
        end_time: endTime,
        email,
        constraints: [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend API error:', errorData);
      return NextResponse.json(
        { message: errorData.detail || 'Failed to fetch free time slots' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Raw backend response:', data);
    
    // Parse the JSON string response from the backend if needed
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    console.log('Parsed backend response:', parsedData);
    
    // Check if authentication is required
    if (parsedData.requires_auth && parsedData.auth_url) {
      console.log('Auth required, returning auth URL');
      return NextResponse.json({
        requires_auth: true,
        auth_url: parsedData.auth_url
      });
    }
    
    // Check if the response has the expected format
    if (!parsedData.success) {
      console.error('Backend reported failure:', parsedData.error);
      return NextResponse.json(
        { message: parsedData.error || 'Failed to fetch free time slots' },
        { status: 400 }
      );
    }

    // Make sure free_slots is an array
    const freeSlots = Array.isArray(parsedData.free_slots) ? parsedData.free_slots : [];
    console.log('Extracted free slots:', freeSlots);

    // Return the free slots in a format expected by the frontend
    const response_data = {
      success: true,
      freeSlots: freeSlots,
      date: parsedData.date
    };
    console.log('Sending response to frontend:', response_data);
    return NextResponse.json(response_data);
  } catch (error) {
    console.error('Error in free-slots API route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 