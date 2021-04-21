import SocketWrapper from "./socket/socketWrapper";
import { FSCFunctionsI } from "./index";
import {
  Currency,
  FSC_API_CLIENT_NOTIFICATION,
  FSC_API_CLIENT_RESPONSE,
  PumpStatus,
  TransactionStatus,
  Volume,
} from "./utils/types";
import { customConsole } from "./utils/helpers";

class Session {
  private functions: FSCFunctionsI;
  private socketWrapper: SocketWrapper;
  id: number;

  constructor(id: number, socketWrapper: SocketWrapper, functions: FSCFunctionsI) {
    this.id = id;
    this.functions = functions;
    this.socketWrapper = socketWrapper;
  }

  handleSessionMode = (state: string) => {
    try {
      this.functions.onSessionMode(this, state);
    } catch (e) {
      customConsole.error(e);
    }
  }

  handleClearRequest = (tag: string, pumpNr: string, transactionId: string, pacePaymentId: string) => {
    try {
      this.functions.onClear(this, parseInt(pumpNr), transactionId, pacePaymentId);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.OK);
    } catch (e) {
      customConsole.error(e);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.ERR, e.message);
    }
  };

  handlePricesRequest = (tag: string) => {
    try {
      this.functions.onPrices(this);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.OK);
    } catch (e) {
      customConsole.error(e);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.ERR, e.message);
    }
  };

  handlePumpsRequest = (tag: string) => {
    try {
      this.functions.onPumps(this);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.OK);
    } catch (e) {
      customConsole.error(e);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.ERR, e.message);
    }
  };

  handlePumpStatusRequest = (tag: string, pumpNr: string, updateTTL?: string) => {
    try {
      this.functions.onPumpStatus(this, parseInt(pumpNr));
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.OK);
    } catch (e) {
      customConsole.error(e);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.ERR, e.message);
    }
  };

  handleTransactionsRequest = (tag: string, pumpNr?: string, updateTTL?: string) => {
    try {
      let pump = pumpNr ? parseInt(pumpNr) : null;
      this.functions.onTransactions(this, pump, updateTTL);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.OK);
    } catch (e) {
      customConsole.error(e);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.ERR, e.message);
    }
  };

  pump(id: number, status: string) {
    if (!Object.values(PumpStatus).includes(status as PumpStatus)) {
      throw new Error(`Not supported pump status ${status}, change status to: ${PumpStatus.free}, ${PumpStatus.inUse}, ${PumpStatus.readyToPay} or ${PumpStatus.outOfOrder}`);
    }
    this.socketWrapper.sendNotification(FSC_API_CLIENT_NOTIFICATION.PUMP, `${id} ${status}`);
  }

  price(productId: string, unit: string, currency: string, pricePerUnit: number,
        description: string) {
    if (!Object.values(Volume).includes(unit as Volume)) {
      throw new Error(`Not supported unit, change unit to: ${Volume.LTR}`);
    }
    if (!Object.values(Currency).includes(currency as Currency)) {
      throw new Error(`Not supported currency`);
    }
    this.socketWrapper.sendNotification(FSC_API_CLIENT_NOTIFICATION.PRICE, `${productId} ${unit} ${currency} ${pricePerUnit.toFixed(3)} ${description}`);
  }

  handleLockPumpRequest = (tag: string, pumpNr : string) => {
    try {
      this.functions.onLockPump(this, parseInt(pumpNr));
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.OK);
    } catch (e) {
      customConsole.error(e);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.ERR, e.message);
    }
  };

  handleUnlockPumpRequest = (tag: string, pumpNr : string, currency : string, credit : string, paceTransactionId : string, ...productIds : string[]) => {
    try {
      this.functions.onUnlockPump(this, parseInt(pumpNr), currency, parseFloat(credit), paceTransactionId, ...productIds);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.OK);
    } catch (e) {
      customConsole.error(e);
      this.socketWrapper.sendResponse(tag, FSC_API_CLIENT_RESPONSE.ERR, e.message);
    }
  };

  transaction(pumpId: number, siteTransactionId: string, status: string,
              productId: string, currency: string, priceWithVAT: number,
              priceWithoutVAT: number, VATRate: number, VATAmount: number,
              unit: string, volume: number, pricePerUnit: number) {
    if (!Object.values(TransactionStatus).includes(status as TransactionStatus)) {
      throw new Error(`Not supported status, change status to: ${TransactionStatus.open} or ${TransactionStatus.deferred}`);
    }
    let args = `${pumpId} ${siteTransactionId} ${status} ${productId} ${currency} ` +
      `${priceWithVAT.toFixed(2)} ${priceWithoutVAT.toFixed(2)} ` +
      `${VATRate.toFixed(2)} ${VATAmount.toFixed(2)} ` +
      `${unit} ${volume.toFixed(2)} ${pricePerUnit.toFixed(3)}`;
    this.socketWrapper.sendNotification(FSC_API_CLIENT_NOTIFICATION.TRANSACTION, args);
  }
}

export default Session;
