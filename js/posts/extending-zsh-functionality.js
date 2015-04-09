(function() {
  var cursor = document.getElementsByClassName('cursor')[0];
  var options = ["visible", "hidden"];
  var toggle = 0;
  setInterval(function() {
    cursor.style.visibility = options[toggle];
    toggle = (toggle + 1) % 2;
  }, 1000);
  var battery = document.getElementsByClassName('battery')[0];
  function setLevel(result) {
    var level = Math.round(result.level * 10);
    var indicator = "";
    for (var i = 0; i < 10; i++) {
      if (i < level) {
        indicator += "▸";
      }
      else {
        indicator += "▹";
      }
    }
    battery.textContent = indicator;
    if (result.charging) {
      battery.style.color = "#59e5f2";
    }
    else if (level > 6) {
      battery.style.color = "green";
    }
    else if (level > 4) {
      battery.style.color = "yellow";
    }
    else {
      battery.style.color = "red";
    }
  }
  if (typeof(navigator.getBattery) !== "undefined") {
    (function getBattery() {
      navigator.getBattery().then(function(result) {
        setLevel(result);
      });
      setTimeout(getBattery, 10000);
    })();
  }
  else if (typeof(navigator.battery !== "undefined")) {
    (function getBattery() {
      setLevel(navigator.battery);
      setTimeout(getBattery, 10000);
    })();
  }
  var date = document.getElementsByClassName('date')[0];
  var time = document.getElementsByClassName('time')[0];
  setInterval(function() {
    var dateTime = new Date();
    date.textContent = dateTime.toDateString();
    var hour = dateTime.getHours();
    var timeString = hour + ":";
    var minutes = dateTime.getMinutes();
    if (minutes < 10) {
      timeString += "0";
    }
    timeString += minutes;
    time.textContent = timeString;
    if (hour > 0 && hour < 4) {
      time.style.color = "red";
    }
    else {
      time.style.color = "#aaa";
    }
  }, 1000);
  var terminal = document.getElementsByClassName('terminal')[0];
  var line = document.getElementsByClassName('line')[0];
  var spaces = document.getElementsByClassName('spaces')[0];
  setInterval(function() {
    var width = terminal.offsetWidth;
    var newLine = "-----";
    var newSpaces = "     ";
    var numChars = Math.round(width / 7.143);
    for (var i = 0; i < (numChars - 56 - 5); i++) {
      newLine += "-";
      newSpaces += " ";
    }
    line.textContent = newLine;
    spaces.textContent = newSpaces;
  }, 1000);
})();
