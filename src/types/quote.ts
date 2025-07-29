export interface ServiceItem {
  id: string;
  name: string;
  subtext: string;
  included: boolean;
  cost: number | null;
}

export interface QuoteData {
  id: string;
  companyName: string;
  baseCost: number | null;
  serviceItems: ServiceItem[];
  shipmentWeight: number | null;
  shipmentVolume: number | null;
  transitTimeMin: number | null;
  transitTimeMax: number | null;
  insurancePercentage: number | null;
}

export interface CalculatedMetrics {
  totalCost: number;
  pricePerPound: number | null;
  pricePerCubicFoot: number | null;
}

export interface ComparisonData {
  quotes: QuoteData[];
  calculations: Record<string, CalculatedMetrics>;
}

export const DEFAULT_SERVICE_ITEMS: Omit<ServiceItem, 'included' | 'cost'>[] = [
  {
    id: 'origin-services',
    name: 'Origin Services',
    subtext: 'confirm this includes full pack and wrap along with loading'
  },
  {
    id: 'crating',
    name: 'Crating',
    subtext: 'combine origin and destination crating if provided separately'
  },
  {
    id: 'shuttle-services',
    name: 'Shuttle Services',
    subtext: 'For difficult-to-access locations, e.g., narrow streets'
  },
  {
    id: 'parking-permits',
    name: 'Parking Permits',
    subtext: 'Arranged for origin and destination'
  },
  {
    id: 'storage-in-transit',
    name: 'Storage-in-Transit (SIT)',
    subtext: 'Up to [X] days of storage, if needed'
  },
  {
    id: 'destination-terminal-handling',
    name: 'Destination Terminal Handling Charges (DTHC)',
    subtext: 'Many competitors exclude DTHC, adding significant costs at the destination port'
  },
  {
    id: 'customs-clearance',
    name: 'Customs Clearance Fees',
    subtext: 'Documentation and processing'
  },
  {
    id: 'delivery-services',
    name: 'Delivery Services',
    subtext: 'confirm this includes unpacking'
  }
]; 