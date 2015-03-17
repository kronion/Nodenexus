(function() {
  iFrameResize({ 'heightCalculationMethod': 'lowestElement' });
  var storeButtons = document.getElementsByClassName('webstore');
  for (var i = 0; i < storeButtons.length; i++) {
    storeButtons[i].onclick = function() { 
      chrome.webstore.install(function() {
        this.classList.add('added');
        this.innerText = 'ADDED TO CHROME';
      },
      function() {
        this.innerHTML = '<div></div>ADD TO CHROME';
      });
      this.innerText = 'CHECKING...';
    }
  }
})();
