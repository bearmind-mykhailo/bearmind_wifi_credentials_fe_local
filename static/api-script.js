// API CALLS
async function fetchWithErrorHandling(url, options) {
    const response = await fetch(url, options);
  
    // not in 200-299 range
    if (!response.ok) {
      throw new Error(`HTTP error! At: ${url} Status: ${response.status}`);
    }
  
    return response;
  }

  async function refreshNetworks() {
    let networks = [];
    let known_networks = [];
  
    try {
      const [scanResponse, knownResponse] = await Promise.all([
        fetchWithErrorHandling('/scan_wifi/'),
        fetchWithErrorHandling('/known_wifi/'),
      ]);
  
      const scanData = await scanResponse.json();
      const knownData = await knownResponse.json();
  
      networks.push(...scanData.networks);
      known_networks.push(...knownData.known_networks);
  
      insertNetworksInList(networks, 'connect-new-network-ssid-select');
      createNetworkCard(known_networks, 'known-network-list');
    } catch (error) {
      console.error('Error fetching WiFi networks', error);
    }
  }
  
  async function connectNewNetwork(network, psk) {
    await fetchWithErrorHandling('/connect_wifi/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ssid: network,
        psk: psk,
      }),
    });
  }
  
  async function saveNewNetwork(network, psk) {
    await fetchWithErrorHandling('/save_wifi/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ssid: network,
        psk: psk,
      }),
    });
  }
  
  async function deleteKnownNetwork(network) {
    await fetchWithErrorHandling('/delete_wifi/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ssid: network,
      }),
    });
  }
  
  async function disconnectDockstation() {
    await fetchWithErrorHandling('/cancel/', {
      method: 'POST',
    });
  }