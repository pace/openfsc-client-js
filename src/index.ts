import SocketWrapper from "./socket/socketWrapper";
import Session from "./session";

export interface FSCFunctionsI {
  onClear: Function
  onPrices: Function,
  onPumps: Function,
  onPumpStatus: Function,
  onTransactions: Function,
}

class FSC {
  functions: FSCFunctionsI;
  socketWrapper: SocketWrapper;
  sessions: Map<string, Session>;

  constructor(functions: FSCFunctionsI) {
    this.functions = functions;
    this.sessions = new Map();
    this.socketWrapper = new SocketWrapper(this.sessions);
  }

  async connect({ siteID, secret }: { siteID: string, secret: string }) {
    this.socketWrapper.siteID = siteID;
    this.socketWrapper.secret = secret;
    const session = new Session(1, this.socketWrapper, this.functions);
    this.sessions.set('s1', session);

    await this.socketWrapper.connect();
    await this.socketWrapper.charset();
    await this.socketWrapper.plainAuth();

    return session;
  }

  newSession({ siteID, secret }: { siteID: string, secret: string }) {
    // Not implemented yet
  }

  disconnect() {
    this.socketWrapper.disconnect();
  }
}

export default FSC;
