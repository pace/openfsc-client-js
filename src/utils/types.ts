export enum Volume {
  LTR = "LTR"
}

export enum Currency {
  EUR = "EUR"
}

export enum TransactionStatus {
  open = "open",
  deferred = "deferred"
}

export enum PumpStatus {
  free = "free",
  inUse = "in-use",
  locked = "locked",
  outOfOrder = "out-of-order",
  readyToPay = "ready-to-pay"
}

export enum FSC_API_CLIENT_NOTIFICATION {
  CAPABILITY = 'CAPABILITY',
  PRICE = 'PRICE',
  PUMP = 'PUMP',
  TRANSACTION = 'TRANSACTION',
  QUIT = 'QUIT'
}

export enum FSC_API_CLIENT_REQUEST {
  CHARSET = 'CHARSET',
  PLAINAUTH = 'PLAINAUTH'
}

export enum FSC_API_CLIENT_RESPONSE {
  BEAT = 'BEAT',
  ERR = 'ERR',
  OK = 'OK',
}

export enum FSC_API_SERVER_NOTIFICATION {
  CAPABILITY = 'CAPABILITY',
  ERR = 'ERR',
  QUIT = 'QUIT',
}

export enum FSC_API_SERVER_REQUEST {
  CLEAR = 'CLEAR',
  HEARTBEAT = 'HEARTBEAT',
  LOCKPUMP = 'LOCKPUMP',
  PRICES = 'PRICES',
  PUMPS = 'PUMPS',
  PUMPSTATUS = 'PUMPSTATUS',
  TRANSACTIONS = 'TRANSACTIONS',
  UNLOCKPUMP = 'UNLOCKPUMP'
}

export enum FSC_API_SERVER_RESPONSE {
  ERR = 'ERR',
  OK = 'OK',
}

export interface Requests {
  [key: string]: {
    resolve: Function,
    reject: Function
  }
}
