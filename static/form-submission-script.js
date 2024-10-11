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
      confirmationIconEl.src = './static/icons/wifi.svg';
  
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