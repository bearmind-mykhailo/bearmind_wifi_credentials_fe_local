var notyf = new Notyf({
  position: { x: 'right', y: 'top' },
  ripple: false,
});

const confirmDeleteDialogEl = document.getElementById('confirm-delete-dialog');
confirmDeleteDialogEl.addEventListener('close', () => {
  const selectedNetwork = confirmDeleteDialogEl.dataset.selectedNetwork;
  const selectedNetworkIndex = confirmDeleteDialogEl.dataset.selectedNetworkIndex;

  if (confirmDeleteDialogEl.returnValue === 'confirm' && selectedNetwork) {
    // TODO(AC): Call the delete function before removing the item?
    const listItem = document.getElementById(`${selectedNetwork}-${selectedNetworkIndex}`);

    listItem.remove();
    deleteKnownNetwork(selectedNetwork);

    delete promptDialog.dataset.selectedNetwork;
    delete promptDialog.dataset.selectedNetworkIndex;
  }
});

function insertNetworksInList(networks, id) {
  const ssidSelectEl = document.getElementById(id);
  ssidSelectEl.innerHTML = '';
  networks.forEach((network) => {
    const option = document.createElement('option');
    option.value = network;
    option.textContent = network;
    ssidSelectEl.appendChild(option);
  });
}

const confirmDeleteDialogTextEl = document.getElementById('confirm-delete-dialog-text');
function createNetworkCard(networks, id) {
  const networksListEl = document.getElementById(id);
  networksListEl.innerHTML = '';

  networks.forEach((network, index) => {
    const listItem = document.createElement('li');
    listItem.id = `${network}-${index}`;
    listItem.textContent = network;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';

    // show modal & modify text
    deleteButton.addEventListener('click', (event) => {
      event.preventDefault();

      confirmDeleteDialogTextEl.textContent = 'Do you really want to remove ';
      const strongEl = document.createElement('strong');
      strongEl.textContent = network;
      confirmDeleteDialogTextEl.appendChild(strongEl);
      confirmDeleteDialogTextEl.appendChild(document.createTextNode('?'));

      confirmDeleteDialogEl.dataset.selectedNetwork = network;
      confirmDeleteDialogEl.dataset.selectedNetworkIndex = index;
      confirmDeleteDialogEl.showModal();
    });

    listItem.appendChild(deleteButton);
    networksListEl.appendChild(listItem);
  });
}

function testOnDelete() {
  confirmDeleteDialogTextEl.textContent = 'Do you really want to remove ';
  const strongEl = document.createElement('strong');
  strongEl.textContent = 'KnownNetwork2';
  confirmDeleteDialogTextEl.appendChild(strongEl);
  confirmDeleteDialogTextEl.appendChild(document.createTextNode('?'));

  confirmDeleteDialogEl.dataset.network = 'KnownNetwork2';
  confirmDeleteDialogEl.showModal();
}

function fetchKnownNetworks() {
  fetch('/known_wifi/')
    .then((response) => response.json())
    .then((data) => createNetworkCard(data.known_networks, 'known-network-list'));
}

function fetchNetworks() {
  fetch('/scan_wifi/')
    .then((response) => response.json())
    .then((data) => insertNetworksInList(data.networks, 'connect-new-network-ssid-select'));
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
      insertNetworksInList(networks, 'connect-new-network-ssid-select');
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

  const activeTabEl = document.getElementById(tabId);
  activeTabEl.style.display = 'flex';

  const tabHeaders = document.querySelectorAll('.tab-header__item');
  tabHeaders.forEach((header) => {
    header.classList.remove('header__item__active');
  });
  document.getElementById(`header-${tabId}`).classList.add('header__item__active');
}

document.addEventListener('DOMContentLoaded', () => {
  refreshNetworks();
  showTab('connect-new-network-form');
});

const tabsContentEl = document.getElementById('tabs-content');
const containerContentEl = document.getElementById('container-content');
const confirmationContentEl = document.getElementById('confirmation-content');
const confirmationHeaderEl = document.getElementById('confirmation-header');
const confirmationInfo1El = document.getElementById('confirmation-info-1');
const connectNewNetworkSSIDSelect = document.getElementById('connect-new-network-ssid-select');
const confirmationReturnBtnEl = document.getElementById('confirmation-return-btn');
const saveNewSSIDInput = document.getElementById('save-new-ssid-input');
const saveNewNetworkPassword = document.getElementById('save-new-network-password');

function goBack() {
  confirmationContentEl.style.display = 'none';
  confirmationReturnBtnEl.style.display = 'none';

  tabsContentEl.style.display = 'flex';
  containerContentEl.style.maxHeight = '52rem';

  saveNewSSIDInput.value = '';
  saveNewNetworkPassword.value = '';

  refreshNetworks();
  showTab('connect-new-network-form');
}

const connectNewNetworkForm = document.getElementById('connect-new-network-form');
connectNewNetworkForm.addEventListener('submit', function (event) {
  // TODO - api call
  event.preventDefault();

  // hide tabs content
  tabsContentEl.style.display = 'none';

  // shrink whole popup
  containerContentEl.style.maxHeight = '34rem';

  // set custom texts
  confirmationInfo1El.textContent = 'The Bearmind Dockstation is now connecting to ';
  const strongEl = document.createElement('strong');
  strongEl.textContent = connectNewNetworkSSIDSelect.value;
  confirmationInfo1El.appendChild(strongEl);
  confirmationInfo1El.appendChild(
    document.createTextNode('. Your computer will be disconnected from the local network.'),
  );

  // show confirmation content
  confirmationContentEl.style.display = 'flex';
  confirmationReturnBtnEl.style.display = 'none';

  notyf.success('Successfully connected to the new Wi-Fi network!');
});

const saveNewNetworkForm = document.getElementById('save-new-network-form');
saveNewNetworkForm.addEventListener('submit', function (event) {
  // TODO - api call
  event.preventDefault();

  // hide tabs content
  tabsContentEl.style.display = 'none';

  // shrink whole popup
  containerContentEl.style.maxHeight = '34rem';

  // set custom texts
  confirmationHeaderEl.textContent = 'A new Wi-Fi network has been added!';
  confirmationInfo1El.textContent =
    'The network has been successfully saved. It will automatically connect whenever you are within range, ensuring a seamless connection.';

  // show confirmation content
  confirmationContentEl.style.display = 'flex';
  confirmationReturnBtnEl.style.display = 'block';

  notyf.success('Successfully saved a new Wi-Fi network!');
});
