function insertNetworksInList(networks, id) {
  const ssidSelect = document.getElementById(id);
  ssidSelect.innerHTML = '';
  networks.forEach((network) => {
    const option = document.createElement('option');
    option.value = network;
    option.textContent = network;
    ssidSelect.appendChild(option);
  });
}

function createNetworkCard(networks, id) {
  const networksList = document.getElementById(id);
  networksList.innerHTML = '';
  networks.forEach((network) => {
    const listItem = document.createElement('li');
    listItem.textContent = network;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.style.marginLeft = '10px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.addEventListener('click', (event) => {
      event.preventDefault();
      // TODO(AC): Call the delete function before removing the item?
      if (confirm(`Are you sure you want delete the network ${network} ?`)) {
        listItem.remove(network);
        deleteKnownNetwork(network);
      }
    });
    listItem.appendChild(deleteButton);
    networksList.appendChild(listItem);
  });
}

function fetchKnownNetworks() {
  fetch('/known_wifi/')
    .then((response) => response.json())
    .then((data) => createNetworkCard(data.known_networks, 'known-network-list'));
}

function fetchNetworks() {
  fetch('/scan_wifi/')
    .then((response) => response.json())
    .then((data) => insertNetworksInList(data.networks, 'new-ssid-select'));
}

function deleteKnownNetwork(network) {
  fetch('/delete_wifi/', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ssid: network,
    }),
  });
}

function refreshNetworks() {
  let networks = [];
  let known_networks = [];

  Promise.all([
    fetch('/scan_wifi/')
      .then((response) => response.json())
      .then((data) => {
        networks.push(...data.networks);
      }),
    fetch('/known_wifi/')
      .then((response) => response.json())
      .then((data) => {
        known_networks.push(...data.known_networks);
      }),
  ])
    .then(() => {
      insertNetworksInList(networks, 'new-ssid-select');
      createNetworkCard(known_networks, 'known-network-list');

      const current_networks = networks.filter((network) => known_networks.includes(network));
      insertNetworksInList(current_networks, 'current-ssid-select');
    })
    .catch((error) => {
      console.error('Error fetching WiFi networks', error);
    });
}

function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.style.display = 'none';
  });

  const activeTab = document.getElementById(tabId);
  activeTab.style.display = 'flex';

  const tabHeaders = document.querySelectorAll('.tab-header');
  tabHeaders.forEach((header) => {
    header.classList.remove('active');
  });
  document.getElementById(`header-${tabId}`).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  refreshNetworks();
  showTab('add-network');
});
