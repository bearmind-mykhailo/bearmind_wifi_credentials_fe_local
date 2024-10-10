// INIT LIBS
var notyf = new Notyf({
  position: { x: 'right', y: 'top' },
  ripple: false,
});

// DOM NODES
const tabsContentEl = document.getElementById('tabs-content');

const containerContentEl = document.getElementById('container-content');

const confirmationContentEl = document.getElementById('confirmation-content');
const confirmationHeaderEl = document.getElementById('confirmation-header');
const confirmationIconEl = document.getElementById('confirmation-icon');
const confirmationInfo1El = document.getElementById('confirmation-info-1');
const confirmationInfo2El = document.getElementById('confirmation-info-2');
const confirmationReturnBtnEl = document.getElementById('confirmation-return-btn');

const saveNewSSIDInputEl = document.getElementById('save-new-ssid-input');
const saveNewNetworkPasswordEl = document.getElementById('save-new-network-password');
const saveNewNetworkFormEl = document.getElementById('save-new-network-form');

const confirmDialogEl = document.getElementById('confirm-dialog');
const confirmDeleteDialogHeaderEl = document.getElementById('confirm-dialog-header');
const confirmDialogTextEl = document.getElementById('confirm-dialog-text');

const connectNewNetworkSSIDSelectEl = document.getElementById('connect-new-network-ssid-select');
const connectNewNetworkFormEl = document.getElementById('connect-new-network-form');
const connectNewNetworkPasswordEl = document.getElementById('connect-new-network-password');

// API CALLS
async function fetchWithErrorHandling(url, options) {
  const response = await fetch(url, options);

  // not in 200-299 range
  if (!response.ok) {
    throw new Error(`HTTP error! At: ${url} Status: ${response.status}`);
  }

  return response;
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

// PROMPT ACTIONS
confirmDialogEl.addEventListener('close', async () => {
  if (confirmDialogEl.returnValue === 'confirm') {
    const selectedNetwork = confirmDialogEl.dataset.selectedNetwork;
    const selectedNetworkIndex = confirmDialogEl.dataset.selectedNetworkIndex;
    const disconnect = confirmDialogEl.dataset.disconnect;

    // DELETE NETWORK
    if (selectedNetwork && selectedNetworkIndex) {
      try {
        await deleteKnownNetwork(selectedNetwork);

        const listItem = document.getElementById(`${selectedNetwork}-${selectedNetworkIndex}`);
        listItem.remove();

        delete confirmDialogEl.dataset.selectedNetwork;
        delete confirmDialogEl.dataset.selectedNetworkIndex;
      } catch (error) {
        console.error('Error deleting network', error);
        notyf.error('Error deleting network');
      }
    } else if (disconnect) {
      // DISCONNECT NOW
      tabsContentEl.style.display = 'none';
      containerContentEl.style.maxHeight = '28rem';
      confirmationHeaderEl.textContent = 'Disconnecting';
      confirmationInfo1El.textContent =
        'Your computer will now be disconnected from the Bearmind Dockstation.';
      confirmationIconEl.src = './static/icons/disconnect.svg';
      confirmationContentEl.style.display = 'flex';
      delete confirmDialogEl.dataset.disconnect;
    }
  }
});

function insertNetworksInList(networks, id) {
  const ssidSelectEl = document.getElementById(id);
  ssidSelectEl.innerHTML = '';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.disabled = true;
  defaultOption.hidden = true;
  defaultOption.textContent = 'Select SSID';
  ssidSelectEl.appendChild(defaultOption);

  networks.forEach((network) => {
    const option = document.createElement('option');
    option.value = network;
    option.textContent = network;
    ssidSelectEl.appendChild(option);
  });

  ssidSelectEl.value = '';
}

function createNetworkCard(networks, id) {
  const networksListEl = document.getElementById(id);
  networksListEl.innerHTML = '';

  networks.forEach((network, index) => {
    const listItem = document.createElement('li');
    listItem.id = `${network}-${index}`;
    listItem.textContent = network;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.classList.add('del-network-btn');

    // show modal & modify text
    deleteButton.addEventListener('click', (event) => {
      event.preventDefault();

      confirmDialogTextEl.textContent = 'Do you really want to remove ';
      const strongEl = document.createElement('strong');
      strongEl.textContent = network;
      confirmDialogTextEl.appendChild(strongEl);
      confirmDialogTextEl.appendChild(document.createTextNode('?'));

      confirmDialogEl.dataset.selectedNetwork = network;
      confirmDialogEl.dataset.selectedNetworkIndex = index;
      confirmDeleteDialogHeaderEl.textContent = 'Delete network';

      confirmDialogEl.showModal();
    });

    listItem.appendChild(deleteButton);
    networksListEl.appendChild(listItem);
  });
}

function testOnDelete() {
  confirmDialogTextEl.style.display = 'block';
  confirmDialogTextEl.textContent = 'Do you really want to remove ';
  const strongEl = document.createElement('strong');
  strongEl.textContent = 'KnownNetwork2';
  confirmDialogTextEl.appendChild(strongEl);
  confirmDialogTextEl.appendChild(document.createTextNode('?'));

  confirmDeleteDialogHeaderEl.textContent = 'Delete network';
  confirmDialogEl.showModal();
}

function onDisconnect() {
  confirmDeleteDialogHeaderEl.textContent = 'Disconnect now?';
  confirmDialogTextEl.style.display = 'none';
  confirmDialogTextEl.textContent = '';
  confirmDialogEl.dataset.disconnect = true;
  confirmDialogEl.showModal();
}

function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.style.display = 'none';
  });

  const activeTabEl = document.getElementById(tabId);
  activeTabEl.style.display = 'flex';

  const tabHeaders = document.querySelectorAll('.tab-header__item');
  tabHeaders.forEach((header) => {
    header.classList.remove('header__item__active');
  });
  document.getElementById(`header-${tabId}`).classList.add('header__item__active');
}

// RETURN FROM SAVE WIFI CONFIRMATION VIEW
async function goBack() {
  confirmationContentEl.style.display = 'none';
  confirmationReturnBtnEl.style.display = 'none';

  tabsContentEl.style.display = 'flex';
  containerContentEl.style.maxHeight = '52rem';

  saveNewSSIDInputEl.value = '';
  saveNewNetworkPasswordEl.value = '';

  await refreshNetworks();
  showTab('connect-new-network-form');
}

// CONNECT NEW NETWORK FORM
connectNewNetworkFormEl.addEventListener('submit', async function (event) {
  event.preventDefault();

  try {
    await connectNewNetwork(connectNewNetworkSSIDSelectEl.value, connectNewNetworkPasswordEl.value);
    tabsContentEl.style.display = 'none';
    containerContentEl.style.maxHeight = '28rem';

    // set custom texts
    confirmationInfo1El.textContent = 'The Bearmind Dockstation is now connecting to ';
    const strongEl = document.createElement('strong');
    strongEl.textContent = connectNewNetworkSSIDSelectEl.value;
    confirmationInfo1El.appendChild(strongEl);
    confirmationInfo1El.appendChild(
      document.createTextNode('. Your computer will be disconnected from the local network.'),
    );

    // show confirmation content
    confirmationContentEl.style.display = 'flex';
    confirmationReturnBtnEl.style.display = 'none';
    confirmationInfo2El.style.display = 'block';
    confirmationInfo2El.textContent =
      'Monitor the Wi-Fi LED on the Bearmind Dockstation to ensure that it has successfully connected to the Wi-Fi network.';

    notyf.success('Successfully connected to the new Wi-Fi network!');
  } catch (error) {
    console.error('connectNewNetwork - error: ', error);
    notyf.error('Error connecting to the new Wi-Fi network!');
  }
});

// SAVE NEW NETWORK FORM
saveNewNetworkFormEl.addEventListener('submit', async function (event) {
  event.preventDefault();

  try {
    await saveNewNetwork(saveNewSSIDInputEl.value, saveNewNetworkPasswordEl.value);

    tabsContentEl.style.display = 'none';
    containerContentEl.style.maxHeight = '28rem';

    // set custom texts
    confirmationHeaderEl.textContent = 'A new Wi-Fi network has been added!';
    confirmationInfo1El.textContent =
      'The network has been successfully saved. It will automatically connect whenever you are within range, ensuring a seamless connection.';
    confirmationInfo2El.style.display = 'none';
    confirmationInfo2El.style.textContent = '';

    // show confirmation content
    confirmationContentEl.style.display = 'flex';
    confirmationReturnBtnEl.style.display = 'block';

    notyf.success('Successfully saved a new Wi-Fi network!');
  } catch (error) {
    console.error('saveNewNetwork - error: ', error);
    notyf.error('Failed to save a new Wi-Fi network!');
  }
});

// ON DOM LOAD
document.addEventListener('DOMContentLoaded', async () => {
  await refreshNetworks();
  showTab('connect-new-network-form');
});
