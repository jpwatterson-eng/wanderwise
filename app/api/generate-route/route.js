import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Add this debug line
    console.log('API route called')
    
    const body = await request.json()
    console.log('Received data:', body)
    
    const { city, interests, fitness, duration } = body

    // Validate inputs
    if (!city || !interests) {
      return NextResponse.json(
        { error: 'City and interests are required' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert local guide creating a perfect walking tour. Generate a detailed walking route for the following request:

City: ${city}
Interests: ${interests}
Fitness Level: ${fitness}
Duration: ${duration} hours

Create a walking route that:
1. Starts and ends at convenient, accessible locations
2. Flows naturally from point to point
3. Includes ${duration >= 3 ? '6-8' : '4-6'} interesting stops
4. Matches the fitness level (easy = flat, short distances; moderate = some hills, reasonable distances; challenging = hills ok, longer distances)
5. Focuses on the specified interests

CRITICAL: You must respond with ONLY valid JSON. Do not include any text outside the JSON structure, including markdown code blocks or backticks.

Format your response as a JSON object with this EXACT structure:
{
  "routeName": "A catchy name for this route",
  "totalDistance": "X.X km",
  "estimatedTime": "X hours X minutes",
  "difficulty": "Easy/Moderate/Challenging",
  "overview": "A brief 2-3 sentences overview of what makes this route special",
 "stops": [
    {
      "number": 1,
      "name": "Stop name",
      "description": "2-3 sentences about this location and why it's interesting",
      "duration": "X minutes",
      "walkToNext": "X minutes walk",
      "address": "Full street address of this location",
      "latitude": 50.0875,
      "longitude": 14.4213
    }
  ],
  "tips": [
    "Practical tip 1",
    "Practical tip 2",
    "Practical tip 3"
  ]
}
IMPORTANT: Include accurate latitude and longitude coordinates for each stop. Use real coordinates from ${city}.

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON. Your entire response must be a single JSON object.`

    console.log('Calling Anthropic API...')

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    let responseText = data.content[0].text
    
    // Strip markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    
    const routeData = JSON.parse(responseText)
    
    console.log('Route generated successfully')
    return NextResponse.json(routeData)
    
  } catch (error) {
    console.error('Error in generate-route API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate route' },
      { status: 500 }
    )
  }
}