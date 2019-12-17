import {
  FSC_API_SERVER_NOTIFICATION,
  FSC_API_SERVER_REQUEST
} from "./types";

const date = new Date().toISOString();
export const mockEvents = {
  capability: {
    data: { text: () => `* ${FSC_API_SERVER_NOTIFICATION.CAPABILITY} BEAT CHARSET PLAINAUTH PRICE PUMP TRANSACTION QUIT` }
  },
  clear: {
    data: { text: () => `S0 ${FSC_API_SERVER_REQUEST.CLEAR} 1 c71b9838ad3dfc10` }
  },
  heartbeat: {
    data: { text: () => `S0 ${FSC_API_SERVER_REQUEST.HEARTBEAT} ${date}` }
  },
  prices: {
    data: { text: () => `S0 ${FSC_API_SERVER_REQUEST.PRICES}` }
  },
  pumps: {
    data: { text: () => `S1 ${FSC_API_SERVER_REQUEST.PUMPS}` }
  },
  pumpStatus: {
    data: { text: () => `S2 ${FSC_API_SERVER_REQUEST.PUMPSTATUS} 1` }
  },
  pumpStatusTTL: {
    data: { text: () => `S2 ${FSC_API_SERVER_REQUEST.PUMPSTATUS} 1 10` }
  },
  pumpStatusWrongID: {
    data: { text: () => `S2 ${FSC_API_SERVER_REQUEST.PUMPSTATUS} 11` }
  },
  pumpStatusWrongTTL: {
    data: { text: () => `S2 ${FSC_API_SERVER_REQUEST.PUMPSTATUS} 1 500` }
  },
  transactions: {
    data: { text: () => `S3 ${FSC_API_SERVER_REQUEST.TRANSACTIONS}` }
  }
};
