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

export const getEncodedUTF8Message = (message: string) => {
  const terminatedMessage = `${message}\r\n`;
  return new TextEncoder().encode(terminatedMessage)
};
