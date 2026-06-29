import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { businessType, city } = await request.json()

    if (!businessType || !city) {
      return NextResponse.json({ error: 'Business type and city are required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY is not set')
      return NextResponse.json({ 
        error: 'Google Maps API Key is not configured. Please contact support.',
        results: [] 
      }, { status: 500 })
    }

    const query = `${businessType} in ${city}`
    // Using Google Places API (New) Search Text
    // https://developers.google.com/maps/documentation/places/web-service/text-search
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.websiteUri,places.nationalPhoneNumber,places.userRatingCount,places.id'
      },
      body: JSON.stringify({
        textQuery: query
      })
    })

    const data = await response.json()

    if (data.error) {
      console.error('Google Places API error:', data.error)
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const results = data.places?.map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || 'N/A',
      address: place.formattedAddress || 'N/A',
      rating: place.rating || 0,
      ratingCount: place.userRatingCount || 0,
      website: place.websiteUri || null,
      phone: place.nationalPhoneNumber || 'N/A',
      // We don't have a direct "responds to reviews" field from Places API
      // But we can show the rating and rating count as indicators
    })) || []

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Lead search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
