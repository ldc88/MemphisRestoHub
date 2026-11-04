
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


function getParameter(e, parameterName, defaultValue) {

  if (
    e &&
    e.parameter &&
    e.parameter[parameterName] !== undefined
  ) {
    return e.parameter[parameterName];
  }

  return defaultValue;
}


function formatCurrency(amount) {

  const settings = getSettings();

  const symbol =
    settings.CURRENCY_SYMBOL ||
    CONFIG.DEFAULTS.CURRENCY_SYMBOL;

  return symbol + Number(amount || 0).toFixed(2);
}


function generateID(prefix) {

  const timestamp = new Date().getTime();

  const random =
    Math.floor(Math.random() * 1000);

  return prefix +
    timestamp +
    random;
}
