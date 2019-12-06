const getTimeStamp = () => new Date().toISOString() + " ";

export const customConsole = (function (defaultConsole) {
  return Object.assign({}, defaultConsole, {
    log(text: any) {
      defaultConsole.log(getTimeStamp() + text);
    },
    info(text: any) {
      defaultConsole.info(getTimeStamp() + text);
    },
    warn(text: any) {
      defaultConsole.warn(getTimeStamp() + text);
    },
    error(text: any) {
      defaultConsole.error(getTimeStamp() + text);
    }
  })
}(window.console));

export const getEncodedSocketMessage = (message: string) => {
  const terminatedMessage = `${message}\r\n`;
  const array = new Array(terminatedMessage.length);
  for (let i = 0; i < terminatedMessage.length; ++i) {
    array[i] = terminatedMessage.charCodeAt(i) & 0xFF;
  }
  return new Uint8Array(array);
};
