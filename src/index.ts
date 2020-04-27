import SocketWrapper from "./socket/socketWrapper";
import Session from "./session";

export interface FSCFunctionsI {
  onSessionMode: Function,
  onClear: Function,
  onPrices: Function,
  onPumps: Function,
  onPumpStatus: Function,
  onTransactions: Function,
  onUnlockPump: Function,
  onLockPump: Function,
}

class FSC {
  fscSocketURL: string;
  functions: FSCFunctionsI;
  socketWrapper: SocketWrapper;
  sessions: Map<string, Session>;

  constructor(fscSocketURL: string, functions: FSCFunctionsI) {
    this.fscSocketURL = fscSocketURL;
    this.functions = functions;
    this.sessions = new Map();
    this.socketWrapper = new SocketWrapper(this.fscSocketURL, this.sessions);
  }

  async connect(siteID: string, secret: string) {
    this.socketWrapper.siteID = siteID;
    this.socketWrapper.secret = secret;
    const session = new Session(1, this.socketWrapper, this.functions);
    this.sessions.set('s1', session);

    await this.socketWrapper.connect();
    await this.socketWrapper.charset();
    await this.socketWrapper.plainAuth();

    return session;
  }

  newSession(siteID: string, secret: string ) {
    // Not implemented yet
  }

  disconnect() {
    this.socketWrapper.disconnect();
  }
}

export default FSC;
