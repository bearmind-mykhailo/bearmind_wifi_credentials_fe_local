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
  