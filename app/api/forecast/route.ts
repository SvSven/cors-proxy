import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // static by default, unless reading the request
export const runtime = "nodejs";

const apiHeaders = new Headers({
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "WeatherAppPrototype github.com/SvSven",
});

const getForecast = async (lat: string, lng: string) => {
  console.log(`Fetching forecast for lat: ${lat}, lng: ${lng}`);
  const result = await fetch(
    `https://api.met.no/weatherapi/locationforecast/2.0/mini?lat=${lat}&lon=${lng}`,
    {
      method: "GET",
      headers: apiHeaders,
    }
  );

  if (result) {
    const last_modified = result.headers.get("last-modified");
    const expires = result.headers.get("expires");
    const date = result.headers.get("date");

    console.log(
      `Received response. Date: ${date}, last modified: ${last_modified}, expires: ${expires}`,
      result
    );

    const forecast = await result.json();

    return {
      last_modified: last_modified,
      expires: expires,
      ...forecast,
    };
  }

  console.error("No response from API");

  return false;
};

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    console.error("Missing search parameters", lat, lng);
    return NextResponse.json(
      { error: "Missing search parameters" },
      { status: 400 }
    );
  }

  const forecast = await getForecast(lat, lng);

  if (!forecast) {
    console.error("An error occured while fetching forecast", forecast);
    return NextResponse.json(
      { error: "An error occured while fetching forecast" },
      { status: 500 }
    );
  }

  return NextResponse.json({ forecast: forecast });
}
