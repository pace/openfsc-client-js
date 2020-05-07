import {
  FSC_API_CLIENT_NOTIFICATION,
  FSC_API_CLIENT_REQUEST,
  FSC_API_CLIENT_RESPONSE,
  FSC_API_SERVER_NOTIFICATION,
  FSC_API_SERVER_REQUEST,
  FSC_API_SERVER_RESPONSE,
  Requests,
} from "../utils/types";
import {
  customConsole,
  getEncodedUTF8Message
} from "../utils/helpers";
import Session from "../session";

class SocketWrapper {
  private capabilityClient: string = 'CLEAR HEARTBEAT PRICES PUMPS PUMPSTATUS QUIT TRANSACTIONS SESSIONMODE LOCKPUMP UNLOCKPUMP';
  private capabilityServerRequestID: string = 'CSR';
  private counter: number = 0;
  private isMultiplexing: boolean = false;
  private requests: Requests = {};
  private _secret: string | null = null;
  private _siteID: string | null = null;
  private sessions: Map<string, Session>;
  private socket: WebSocket | null = null;
  private socketUrl: string;

  constructor(socketURL: string, sessions: Map<string, Session>) {
    this.socketUrl = socketURL;
    this.sessions = sessions;
  }

  set siteID(siteID: string) {
    this._siteID = siteID;
  }

  set secret(secret: string) {
    this._secret = secret;
  }

  async connect() {
    const serverCapabilityNotificationPromise = new Promise((resolve, reject) => {
      this.requests[this.capabilityServerRequestID] = { resolve, reject };
      setTimeout(() => {
        // Close web socket connection, if server has not sent a CAPABILITY
        // notification within 30 seconds.
        if (this.requests[this.capabilityServerRequestID]) {
          const errorMessage = 'Server capability notification not sent in' +
            ' time.';
          customConsole.log(errorMessage);
          this.reject(this.capabilityServerRequestID, errorMessage);
          if (this.socket) {
            this.sendNotification(FSC_API_CLIENT_NOTIFICATION.QUIT, errorMessage);
            this.socket.close();
          }
        }
      }, 30000)
    });

    const wsConnectionPromise = new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.socketUrl);
      this.socket.onopen = () => {
        customConsole.log('[ WEB SOCKET CONNECTED ]');
        this.sendNotification(FSC_API_CLIENT_NOTIFICATION.CAPABILITY, this.capabilityClient);
        resolve();
      };
      this.socket.onerror = e => {
        customConsole.log('[ WEB SOCKET ERROR ] ', e);
        reject(e);
      };
      this.socket.onclose = e => {
        customConsole.log('[ WEB SOCKET CONNECTION CLOSING ] ', e);
        this.socket = null;
        Object.keys(this.requests).forEach(tag => this.reject(tag));
        const error = new Error('No response from server');
        reject(error);
        return this.reconnect();
      };
      this.socket.onmessage = this.onMessage;
    });

    await Promise.all([wsConnectionPromise, serverCapabilityNotificationPromise]);
  };

  disconnect() {
    if (this.socket) {
      const message = 'Client requested closing of socket connection.';
      customConsole.log('[ WEB SOCKET CONNECTION CLOSING ] ', message);
      this.socket.onclose = () => {
      };
      this.sendNotification(FSC_API_CLIENT_NOTIFICATION.QUIT, message);
      this.socket.close();
      this.socket = null;
    } else {
      customConsole.log('[ WEB SOCKET CONNECTION COULD NOT BE CLOSED ] ', 'Socket' +
        ' not connected.');
    }
  }

  onMessage = async (event: MessageEvent) => {
    let message = await event.data.text();
    message = message.replace('\r\n', '');
    let [tag, method, ...args] = message.split(" ");
    let sessionId = this.sessions.keys().next().value;
    let isNotification = tag === '*';

    if (this.isMultiplexing) {
      const fields = tag.split(".");
      sessionId = fields[0];
      isNotification = fields[1] === '*';
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      customConsole.warn(`[ WEB SOCKET SESSION DOES NOT EXIST ] | session: '${sessionId}'`);
      return;
    }

    if (isNotification) {
      this.handleReceivedNotification({ session, message, method, args });
    } else {
      const isServerRequest = Object.values(FSC_API_SERVER_REQUEST).includes(method as FSC_API_SERVER_REQUEST);

      if (isServerRequest) {
        this.handleReceivedRequest({ session, message, tag, method, args });
      } else {
        this.handleReceivedResponse({ message, tag, method });
      }
    }
  };

  handleReceivedRequest({ session, message, tag, method, args }: { session: Session, message: string, tag: string, method: string, args: string[] }) {
    customConsole.log(`[ WEB SOCKET RECEIVED REQUEST ]       | ${message}`);

    switch (method) {
      case FSC_API_SERVER_REQUEST.CLEAR:
        session.handleClearRequest(tag, args[0], args[1], args[2]);
        break;
      case FSC_API_SERVER_REQUEST.HEARTBEAT:
        const date = new Date().toISOString();
        this.sendResponse(tag, FSC_API_CLIENT_RESPONSE.BEAT, date.toString());
        this.sendResponse(tag, FSC_API_CLIENT_RESPONSE.OK);
        break;
      case FSC_API_SERVER_REQUEST.LOCKPUMP:
          session.handleLockPumpRequest(tag, args[0]);
        break;
      case FSC_API_SERVER_REQUEST.PRICES:
        session.handlePricesRequest(tag);
        break;
      case FSC_API_SERVER_REQUEST.PUMPSTATUS:
        session.handlePumpStatusRequest(tag, args[0], args[1]);
        break;
      case FSC_API_SERVER_REQUEST.PUMPS:
        session.handlePumpsRequest(tag);
        break;
      case FSC_API_SERVER_REQUEST.TRANSACTIONS:
        session.handleTransactionsRequest(tag, args[0], args[1]);
        break;
      case FSC_API_SERVER_REQUEST.UNLOCKPUMP:
        session.handleUnlockPumpRequest(tag, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
        break;
      default:
        customConsole.warn(`[ WEB SOCKET REQUEST DOES NOT EXIST ] | method: '${method}'`);
    }
  }

  handleReceivedResponse({ message, tag, method }: { message: string, tag: string, method: string }) {
    customConsole.log(`[ WEB SOCKET RECEIVED RESPONSE ]      | ${message}`);
    switch (method) {
      case FSC_API_SERVER_RESPONSE.ERR:
        this.reject(tag);
        break;
      case FSC_API_SERVER_RESPONSE.OK:
        this.resolve(tag);
        break;
      default:
        customConsole.warn(`[ WEB SOCKET RESPONSE DOES NOT EXIST ] | method: '${method}'`);
    }
  }

  handleReceivedNotification({ session, message, method, args }: { session: Session, message: string, method: string, args: string[] }) {
    customConsole.log(`[ WEB SOCKET RECEIVED NOTIFICATION ]  | ${message}`);
    switch (method) {
      case FSC_API_SERVER_NOTIFICATION.CAPABILITY:
        this.resolve(this.capabilityServerRequestID);
        break;
      case FSC_API_SERVER_NOTIFICATION.QUIT:
        customConsole.log(`[ WEB SOCKET RECEIVED QUIT NOTIFICATION ] | reason: ${args.join(" ")}`);
        break;
      case FSC_API_SERVER_NOTIFICATION.SESSIONMODE:
        session.handleSessionMode(args[0])
        break;
      default:
        customConsole.warn(`[ WEB SOCKET NOTIFICATION DOES NOT EXIST ] | method: '${method}'`);
    }
  }

  plainAuth() {
    return this.sendRequest(FSC_API_CLIENT_REQUEST.PLAINAUTH, `${this._siteID} ${this._secret}`);
  }

  charset() {
    return this.sendRequest(FSC_API_CLIENT_REQUEST.CHARSET, 'UTF-8');
  };

  getMessage({ tag, method, args }: { tag: string, method: string, args?: string }) {
    let message = `${tag} ${method}`;
    if (args) {
      message += ` ${args}`
    }
    return message;
  }

  sendEncodedMessage(message: string) {
    if (this.socket !== null && this.socket.readyState === 1) {
      const encodedMessage = getEncodedUTF8Message(message);
      this.socket.send(encodedMessage);
    } else {
      customConsole.warn('[ WEB SOCKET MESSAGE COULD NOT BE SENT ] ');
    }
  }

  sendResponse(tag: string, method: string, args?: string) {
    const message = this.getMessage({ tag, method, args });
    customConsole.log(`[ WEB SOCKET SEND RESPONSE ]          | ${message}`);
    this.sendEncodedMessage(message);
  };

  sendRequest(method: string, args: string) {
    const tag = `C${this.counter++}`;
    const message = this.getMessage({ tag, method, args });
    customConsole.log(`[ WEB SOCKET SEND REQUEST ]           | ${message}`);
    this.sendEncodedMessage(message);

    return new Promise((resolve, reject) => {
      this.requests[tag] = { resolve, reject };
    });
  };

  sendNotification(method: string, args: string) {
    const message = this.getMessage({ tag: '*', method, args });
    customConsole.log(`[ WEB SOCKET SEND NOTIFICATION ]      | ${message}`);
    this.sendEncodedMessage(message);
  };

  async reconnect() {
    customConsole.log('[ WEB SOCKET RECONNECTING ]');
    try {
      await this.connect();
      await this.charset();
      await this.plainAuth();
    } catch (e) {
      customConsole.warn('[ WEB SOCKET RECONNECTION ERROR ]', e);
    }
  }

  resolve(id: string, result?: string) {
    if (this.requests[id]) {
      this.requests[id].resolve(result);
      delete this.requests[id];
    }
  }

  reject(id: string, error?: string) {
    if (this.requests[id]) {
      this.requests[id].reject(error);
      delete this.requests[id];
    }
  }
}

export default SocketWrapper;
