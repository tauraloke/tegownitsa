// middle layer

const ApiConnector = require('./services/api_connector.js');

window.addEventListener('DOMContentLoaded', async () => {
  // any js code here
});

new ApiConnector().connectIpcPreloadHandlers();
