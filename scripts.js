var notyf = new Notyf({
  position: { x: 'right', y: 'top' },
  ripple: false,
});

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

  const tabHeaders = document.querySelectorAll('.tab-header__item');
  tabHeaders.forEach((header) => {
    header.classList.remove('header__item__active');
  });
  document.getElementById(`header-${tabId}`).classList.add('header__item__active');

  // Connect to new network
  const connectNewNetworkPassword = document.getElementById('connect-new-network-password');
  const connectNewNetworkSsidSelect = document.getElementById('connect-new-network-ssid-select');

  // Save new network
  const saveNewNetworkPassword = document.getElementById('save-new-network-password');
  const saveNewNetworkSsidInput = document.getElementById('save-new-ssid-input');

  // Set required attribute for selected tab elements
  if (tabId === 'connect-new-network') {
    connectNewNetworkPassword.setAttribute('required', '');
    connectNewNetworkSsidSelect.setAttribute('required', '');
    saveNewNetworkPassword.removeAttribute('required');
    saveNewNetworkSsidInput.removeAttribute('required');
  } else if (tabId === 'save-new-network') {
    saveNewNetworkPassword.setAttribute('required', '');
    saveNewNetworkSsidInput.setAttribute('required', '');
    connectNewNetworkPassword.removeAttribute('required');
    connectNewNetworkSsidSelect.removeAttribute('required');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  refreshNetworks();
  showTab('connect-new-network');
});

const form = document.getElementById('main-form');
form.addEventListener('submit', function (event) {
  // TODO - api call
  event.preventDefault();

  const tabsContent = document.getElementById('tabs-content');
  tabsContent.style.display = 'none';

  const mainForm = document.getElementById('main-form');
  mainForm.style.maxHeight = '34rem';

  const confirmationContent = document.getElementById('confirmation-content');
  confirmationContent.style.display = 'flex';

  notyf.success('Your changes have been successfully saved!');
});
