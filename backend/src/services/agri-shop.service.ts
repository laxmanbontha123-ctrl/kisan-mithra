export interface NearbyAgriShopInput {
  latitude: number;
  longitude: number;
}

type GooglePlace = {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  googleMapsUri?: string;
  rating?: number;
  businessStatus?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

type GooglePlacesTextSearchResponse = {
  places?: GooglePlace[];
};

function buildMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export class AgriShopService {
  public async findNearbyAgriShops(input: NearbyAgriShopInput) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return {
        success: true,
        configured: false,
        message:
          "Google Places API key is not configured yet. Add GOOGLE_PLACES_API_KEY in backend .env to fetch real nearby agri shops.",
        data: [],
      };
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.googleMapsUri,places.rating,places.businessStatus,places.location",
      },
      body: JSON.stringify({
        textQuery: "fertilizer pesticide agriculture input shop",
        locationBias: {
          circle: {
            center: {
              latitude: input.latitude,
              longitude: input.longitude,
            },
            radius: 8000,
          },
        },
        maxResultCount: 10,
      }),
    });

    const payload = (await response.json()) as GooglePlacesTextSearchResponse & {
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(payload.error?.message || `Google Places request failed with status ${response.status}`);
    }

    const shops = (payload.places ?? []).map((place) => {
      const latitude = place.location?.latitude ?? input.latitude;
      const longitude = place.location?.longitude ?? input.longitude;

      return {
        id: place.id ?? `${latitude}-${longitude}`,
        name: place.displayName?.text ?? "Unnamed agri shop",
        address: place.formattedAddress ?? "Address not available",
        phone: place.nationalPhoneNumber ?? null,
        rating: place.rating ?? null,
        businessStatus: place.businessStatus ?? null,
        latitude,
        longitude,
        mapsUrl: place.googleMapsUri ?? buildMapsUrl(latitude, longitude),
      };
    });

    return {
      success: true,
      configured: true,
      message:
        shops.length > 0
          ? "Nearby agri shops fetched successfully."
          : "No nearby agri shops found for this location.",
      data: shops,
      disclaimer:
        "Shop details come from Google Places. Call or verify in person before purchase because stock, price, and product availability can change.",
    };
  }
}

export const agriShopService = new AgriShopService();
export default agriShopService;
