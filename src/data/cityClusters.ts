export const POPULAR_CITY_CLUSTERS = {
  france: {
    country: 'France',
    cities: ['Paris', 'Marseille', 'Lyon', 'Rennes', 'Lille', 'Bordeaux', 'Nice', 'Toulouse', 'Strasbourg', 'Nantes'],
  },
  spain: {
    country: 'Spain',
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Bilbao', 'Zaragoza', 'Murcia'],
  },
  belgium: {
    country: 'Belgium',
    cities: ['Brussels', 'Antwerp', 'Tournai'],
  },
  'united-kingdom': {
    country: 'United Kingdom',
    cities: ['London', 'Manchester', 'Leeds', 'Birmingham', 'Bristol', 'Liverpool', 'Glasgow', 'Cambridge', 'Oxford', 'Leicester', 'Southampton'],
  },
  germany: {
    country: 'Germany',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Frankfurt', 'Cologne', 'Stuttgart', 'Dusseldorf', 'Dresden', 'Bremen', 'Essen', 'Dortmund', 'Mannheim', 'Nuremberg'],
  },
  italy: {
    country: 'Italy',
    cities: ['Rome', 'Milan', 'Naples', 'Bologna', 'Florence'],
  },
  netherlands: {
    country: 'Netherlands',
    cities: ['Amsterdam', 'Rotterdam', 'Eindhoven', 'Maastricht', 'Groningen', 'Tilburg'],
  },
} as const;

export type CountryKey = keyof typeof POPULAR_CITY_CLUSTERS;

export interface CityLookupEntry {
  countryKey: CountryKey;
  city: string;
}

export const CITY_LOOKUP: Record<string, CityLookupEntry> = Object.entries(POPULAR_CITY_CLUSTERS).reduce(
  (acc, [countryKey, cluster]) => {
    cluster.cities.forEach((city) => {
      acc[city.toLowerCase()] = {
        countryKey: countryKey as CountryKey,
        city,
      };
    });
    return acc;
  },
  {} as Record<string, CityLookupEntry>,
);

export const DEFAULT_POPULAR_CITIES = [
  'London',
  'Berlin',
  'Amsterdam',
  'Paris',
  'Barcelona',
  'Madrid',
  'Munich',
  'Leeds',
] as const;

export const toCityPathSegment = (city: string) => city.toLowerCase();
