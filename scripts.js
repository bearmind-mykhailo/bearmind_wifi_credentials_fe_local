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
      try {
        await disconnectDockstation();
  
        tabsContentEl.style.display = 'none';
        containerContentEl.style.maxHeight = '28rem';
        confirmationHeaderEl.textContent = 'Disconnecting';
        confirmationInfo1El.textContent =
          'Your computer will now be disconnected from the Bearmind Dockstation.';
        confirmationIconEl.src = './static/icons/disconnect.svg';
        confirmationContentEl.style.display = 'flex';
        delete confirmDialogEl.dataset.disconnect;
      } catch (error) {
        console.error('onDisconnect - error: ', error);
        notyf.error('Failed to disconnect dockstation!');
      }
    }
  }
});

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

// ON DOM LOAD
document.addEventListener('DOMContentLoaded', async () => {
  await refreshNetworks();
  showTab('connect-new-network-form');
});
