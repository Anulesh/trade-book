export type sellBuy = {
  depth: string;
  limit_price: string;
  size: number;
  [key: string]: any;
};
export interface EventData {
  buy: sellBuy[];
  last_sequence_no: number;
  last_updated_at: number;
  product_id: number;
  sell: sellBuy[];
  symbol: string;
  timestamp: number;
  type: string;
  [key: string]: any;
}
export interface SubscriptionData {
  channels: { name: string; symbols: string[] }[];
  type: string;
}
export interface OrderbookData extends EventData, SubscriptionData {}
export enum typeTrade {
  'BUY',
  'SELL'
}
export type looseObj = {
  [key: string]: sellBuy;
};
export enum toggleOrderBookActionsType {
  'BUY',
  'SELL',
  'BOTH'
}
export const L2_ORDERBOOK = 'l2_orderbook';
