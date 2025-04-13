import { NextResponse } from 'next/server';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('API key not found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Extract system message if present
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
    const userMessages = messages.filter(msg => msg.role !== 'system');

    // Format messages for Anthropic API
    const formattedMessages = userMessages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log('Sending request to Anthropic API with messages:', formattedMessages);

    // Call Anthropic API - exactly matching the paper generator implementation
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        temperature: 0.7,
        system: systemMessage,
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Anthropic API error:', errorData);
      console.error('Response status:', response.status);
      console.error('Response status text:', response.statusText);
      
      // Properly stringify the error object
      const errorMessage = typeof errorData === 'object' 
        ? JSON.stringify(errorData) 
        : errorData.error || response.statusText;
        
      return NextResponse.json(
        { error: `Failed to get response from AI: ${errorMessage}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Received response from Anthropic API:', data);
    
    // Check if the response has the expected structure - matching paper generator
    if (data.content && Array.isArray(data.content) && data.content.length > 0 && data.content[0].text) {
      return NextResponse.json({
        content: data.content[0].text,
      });
    } else {
      console.error('Unexpected response format from Anthropic API:', data);
      return NextResponse.json(
        { error: 'Unexpected response format from AI' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 