import { QuoteData, CalculatedMetrics, ServiceItem } from '@/types/quote';

export interface QuoteDataPayload {
  quotes: QuoteData[];
  calculations: Record<string, CalculatedMetrics>;
  // Top-level convenience figures the backend maps to typed columns for the
  // back office (base_cost, shipment_weight, ...). Sourced from the Arpin quote
  // (the primary/reference). The full comparison always lives in `quotes`.
  base_cost: number | null;
  shipment_weight: number | null;
  shipment_volume: number | null;
  insurance: number | null;
  transit_time: string;
  service_line_items: ServiceItem[] | null;
}

function formatTransit(min: number | null, max: number | null): string {
  if (min != null && max != null) return `${min}-${max} days`;
  if (min != null) return `${min} days`;
  if (max != null) return `${max} days`;
  return '';
}

/**
 * Shape stored as the backend session's `quote_data`. Carries the full quotes
 * array + calculations (lossless), plus top-level snake_case figures from the
 * Arpin quote so the backend populates its typed columns for the back office.
 */
export function buildQuoteDataPayload(
  quotes: QuoteData[],
  calculations: Record<string, CalculatedMetrics>,
): QuoteDataPayload {
  const primary = quotes.find((q) => q.id === 'arpin-quote') ?? quotes[0];
  return {
    quotes,
    calculations,
    base_cost: primary?.baseCost ?? null,
    shipment_weight: primary?.shipmentWeight ?? null,
    shipment_volume: primary?.shipmentVolume ?? null,
    insurance: primary?.insurancePercentage ?? null,
    transit_time: formatTransit(primary?.transitTimeMin ?? null, primary?.transitTimeMax ?? null),
    service_line_items: primary?.serviceItems ?? null,
  };
}
