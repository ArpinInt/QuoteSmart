/**
 * LLM extraction evaluation against real quote PDFs.
 *
 * Skipped unless all of these are set:
 *   RUN_LLM_EVAL=1        opt-in (real OpenAI calls, slow, costs money)
 *   OPENAI_API_KEY=...    same key the app uses
 *   QUOTE_EVAL_DIR=/path  directory holding the fixture PDFs listed below
 *
 * The fixtures contain customer data, so they are NOT committed. Ask the team
 * for the eval set. Expected fixture file names:
 *   arpin-three-options-QBO2603161.pdf  Arpin, air + sea liftvans + sea loose 1x20' options
 *   arpin-air-liftvans-QBO2503876.pdf   Arpin, air + sea liftvans options
 *   arpin-40ft-austria.pdf              Arpin, 1x40' + 1x20' options plus a separate auto shipment
 *   arpin-campuzano-QBO2602538.pdf      Arpin, single option, itemized accessorials summed into the estimated total
 *   suddath-campuzano.pdf               Suddath, accessorials listed apart, "not currently included" items
 *   btr-munich-eur.pdf                  BTR, EUR document (regression guard)
 *
 * Run:  RUN_LLM_EVAL=1 QUOTE_EVAL_DIR=... npx vitest run src/services/ai/openai/extraction.eval.test.ts
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { extractQuoteData } from './index';
import { ExtractedQuoteData, ExtractedQuotePayload, ExtractedServiceItem } from '@/types/extraction';

const EVAL_DIR = process.env.QUOTE_EVAL_DIR;
const ENABLED = Boolean(process.env.RUN_LLM_EVAL && process.env.OPENAI_API_KEY && EVAL_DIR);
const TIMEOUT_MS = 180_000;

/** Same arithmetic the UI uses (page.tsx calculations). */
function totalOf(d: ExtractedQuotePayload): number {
  const base = d.baseCost ?? 0;
  const services = d.serviceItems.filter((s) => !s.included).reduce((sum, s) => sum + (s.cost ?? 0), 0);
  const other = (d.other ?? []).reduce((sum, o) => sum + o.value, 0);
  return base + services + other;
}

function item(d: ExtractedQuotePayload, id: ExtractedServiceItem['id']): ExtractedServiceItem {
  const found = d.serviceItems.find((s) => s.id === id);
  if (!found) throw new Error(`service item ${id} missing`);
  return found;
}

/** [variantType, containerSizeFt, UI total] of every Arpin option: main first, then the others. */
function optionsOf(d: ExtractedQuoteData): Array<[string | null | undefined, number | null | undefined, number]> {
  return [
    [d.variantType, d.containerSizeFt, totalOf(d)],
    ...(d.additionalArpinQuotes ?? []).map(
      (o): [string, number | null | undefined, number] => [o.variantType, o.containerSizeFt, totalOf(o)]
    ),
  ];
}

function expectNoDoubleCounting(d: ExtractedQuotePayload) {
  // An Arpin service item "not included" with a cost would be added on top of the estimated total.
  for (const s of d.serviceItems) {
    expect(s.included || s.cost === null, `${s.id} is unchecked with a cost`).toBe(true);
  }
}

function summary(file: string, d: ExtractedQuoteData): string {
  const describe = (label: string, q: ExtractedQuotePayload & { variantType?: string | null; containerSizeFt?: number | null }) => [
    `${label}: ${q.companyName} variant=${q.variantType ?? '-'} size=${q.containerSizeFt ?? '-'} quotedTotal=${q.quotedTotal}`,
    `  baseCost=${q.baseCost} total(UI)=${totalOf(q).toFixed(2)}`,
    ...q.serviceItems.map((s) => `  ${s.id.padEnd(32)} ${s.included ? 'INCLUDED' : 'not incl'} cost=${s.cost}`),
    ...(q.other ?? []).map((o) => `  other: ${o.key} = ${o.value} | ${o.description}`),
  ];
  const lines = [
    `--- ${file} ---`,
    `isArpin=${d.isArpinQuote} currency=${d.originalCurrency} rate=${d.exchangeRate}`,
    ...describe('main', d),
    ...(d.additionalArpinQuotes ?? []).flatMap((o, i) => describe(`option ${i + 2}`, o)),
  ];
  return lines.join('\n');
}

async function extract(file: string): Promise<ExtractedQuoteData> {
  const p = path.join(EVAL_DIR as string, file);
  if (!fs.existsSync(p)) throw new Error(`missing fixture: ${p}`);
  const d = await extractQuoteData({ file: { type: 'path', path: p } });
  console.log(summary(file, d));
  return d;
}

describe.skipIf(!ENABLED)('LLM extraction eval (real OpenAI calls)', () => {
  it(
    'Arpin QBO2603161: air, sea liftvans and sea loose 1x20\' become three columns with their own estimated totals',
    async () => {
      const d = await extract('arpin-three-options-QBO2603161.pdf');
      expect(d.isArpinQuote).toBe(true);

      const options = optionsOf(d);
      expect(options).toHaveLength(3);
      // The full-container option is the main Arpin column.
      expect(options[0][0]).toBe('container');
      expect(options[0][1]).toBe(20);
      expect(options[0][2]).toBeCloseTo(10307.7, 2);
      const others = Object.fromEntries(options.slice(1).map(([type, , total]) => [type, total]));
      expect(Object.keys(others).sort()).toEqual(['air', 'liftvan']);
      expect(others.air).toBeCloseTo(9437.35, 2);
      expect(others.liftvan).toBeCloseTo(7286.5, 2);

      expectNoDoubleCounting(d);
      for (const o of d.additionalArpinQuotes ?? []) expectNoDoubleCounting(o);
    },
    TIMEOUT_MS,
  );

  it(
    'Arpin QBO2503876: air and sea liftvans become two columns, liftvans first',
    async () => {
      const d = await extract('arpin-air-liftvans-QBO2503876.pdf');
      expect(d.isArpinQuote).toBe(true);

      const options = optionsOf(d);
      expect(options.map(([type]) => type)).toEqual(['liftvan', 'air']);
      expect(options[0][2]).toBeCloseTo(6040, 2);
      expect(options[1][2]).toBeCloseTo(7030, 2);
    },
    TIMEOUT_MS,
  );

  it(
    'Arpin 40ft Austria: 1x40\' and 1x20\' become two columns; the separate auto shipment is in neither',
    async () => {
      const d = await extract('arpin-40ft-austria.pdf');
      expect(d.isArpinQuote).toBe(true);

      const options = optionsOf(d);
      expect(options.map(([type, size]) => [type, size])).toEqual([
        ['container', 40],
        ['container', 20],
      ]);
      expect(options[0][2]).toBeCloseTo(14475.93, 2);
      expect(options[1][2]).toBeCloseTo(10882.5, 2);

      // Itemized shuttle and parking permit lines are part of each option's estimated total.
      expect(item(d, 'shuttle-services').included).toBe(true);
      expect(item(d, 'parking-permits').included).toBe(true);
      expect(item(d, 'origin-services').included).toBe(true);
      // This document's BASE COST INCLUSIONS do not list customs clearance and no line prices it.
      expect(item(d, 'customs-clearance').included).toBe(false);
      expect(item(d, 'customs-clearance').cost).toBeNull();
      expectNoDoubleCounting(d);
    },
    TIMEOUT_MS,
  );

  it(
    'Arpin QBO2602538: itemized accessorials (incl. "if needed" SIT) are part of the estimated total',
    async () => {
      const d = await extract('arpin-campuzano-QBO2602538.pdf');
      expect(d.isArpinQuote).toBe(true);
      expect(d.additionalArpinQuotes ?? []).toHaveLength(0);

      // Quoted lines summed into "Estimated Truck Loose Charges" are included in Arpin's total.
      expect(item(d, 'crating').included).toBe(true);
      expect(item(d, 'storage-in-transit').included).toBe(true);
      // Base cost inclusions on page 2.
      expect(item(d, 'origin-services').included).toBe(true);
      expect(item(d, 'customs-clearance').included).toBe(true);
      expect(item(d, 'destination-terminal-handling').included).toBe(true);
      expect(item(d, 'delivery-services').included).toBe(true);
      // Base cost exclusions stay unchecked with unknown cost.
      expect(item(d, 'shuttle-services').included).toBe(false);
      expect(item(d, 'shuttle-services').cost).toBeNull();
      expect(item(d, 'parking-permits').included).toBe(false);
      expect(item(d, 'parking-permits').cost).toBeNull();

      expectNoDoubleCounting(d);
      // The UI total must equal Arpin's own estimated total (no double counting of long carry).
      expect(totalOf(d)).toBeCloseTo(25824.2, 0);
    },
    TIMEOUT_MS,
  );

  it(
    'Suddath: accessorials listed apart stay separate; "not currently included" items are excluded with cost',
    async () => {
      const d = await extract('suddath-campuzano.pdf');
      expect(d.isArpinQuote).toBe(false);
      expect(d.additionalArpinQuotes).toBeUndefined();
      expect(d.baseCost).toBeCloseTo(27967.27, 0);
      // Listed apart from the door-to-door price: separate charge, still adds to the total.
      expect(item(d, 'crating').included).toBe(false);
      expect(item(d, 'crating').cost).toBeCloseTo(436.26, 0);
      // "if required ... not currently included": excluded, with the quoted amount.
      expect(item(d, 'storage-in-transit').included).toBe(false);
      expect(item(d, 'storage-in-transit').cost).toBeCloseTo(1190.24, 0);
      expect(item(d, 'shuttle-services').included).toBe(false);
      expect(item(d, 'shuttle-services').cost).toBeCloseTo(360, 0);
      // "Quotation Includes" list.
      expect(item(d, 'customs-clearance').included).toBe(true);
      expect(item(d, 'origin-services').included).toBe(true);
      expect(item(d, 'delivery-services').included).toBe(true);
      // Excluded without a quoted amount.
      expect(item(d, 'parking-permits').included).toBe(false);
      expect(item(d, 'parking-permits').cost).toBeNull();
      // Insurance is a percentage, never a cost added to the total.
      expect(d.insurancePercentage).toBeCloseTo(2.8, 1);
      for (const o of d.other ?? []) {
        expect(`${o.key} ${o.label} ${o.description}`.toLowerCase(), 'insurance placed in other').not.toContain('insurance');
      }
      expect(totalOf(d)).toBeCloseTo(27967.27 + 436.26 + 1190.24 + 360, 0);
    },
    TIMEOUT_MS,
  );

  it(
    'BTR Munich (EUR): regression guard for non-Arpin, non-USD documents',
    async () => {
      const d = await extract('btr-munich-eur.pdf');
      expect(d.isArpinQuote).toBe(false);
      expect(d.originalCurrency).toBe('EUR');
      expect(d.exchangeRate).toBeGreaterThan(0.9);
      expect(d.baseCost).toBeGreaterThan(0);
    },
    TIMEOUT_MS,
  );
});
