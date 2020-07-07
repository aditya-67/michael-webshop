const defaults = {
  'origin': '',
  'status': '',
  'refreshTokenURL': 'https://ilovelamp.staging.maesh.io/refreshtoken'
}

const getQueryParams = (params, url) => {

  let href = url;
  //this expression is to get the query strings
  let reg = new RegExp('[?&]' + params + '=([^&#]*)', 'i');
  let queryString = reg.exec(href);
  return queryString ? queryString[1] : null;
};

const key = getQueryParams('api_key', window.location.href);

function checkOrigin(callback) {
  fetch(defaults.refreshTokenURL, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Origin: "local."
      },
      body: JSON.stringify({
        key: key,
        type: 'maesh'
      }),
    })
    .then((response) => response.json())
    .then((json) => {
      if (json["status"] === "success") {
        callback(json["origin"], 'success');
      } else {
        throw new Error("Invaild Reponse");
      }
    })
    .catch((e) => {
      callback(e, 'error');
    })
}

function callback(data, status) {
  if (status === 'success') {
    defaults.origin = data;
  }
  defaults.status = status;
}

window.addEventListener('load', checkOrigin(callbackOrigin));

if (window.addEventListener) {
  window.addEventListener('message', handleMessage, false);
} else if (window.attachEvent) {
  window.attachEvent('onmessage', handleMessage);
}

function handleMessage(event) {
  // IMPORTANT: check the origin of the data! 
  if (defaults.status === 'success') {
    if (event.origin.startsWith(defaults.origin)) {
      // The data was sent from your site.
      // Data sent with postMessage is stored in event.data:
      if (event.data.status === 'isMobile') {
        document.getElementById("mobile").style.display = "block";
        document.getElementById("desktop").style.display = "none";
      }
      if (event.data.status === 'notMobile') {
        document.getElementById("mobile").style.display = "none";
        document.getElementById("desktop").style.display = "block";
      }
      if (event.data.status === 'createIntentSuccess') {

        document.getElementById("error").style.display = "none";
        document.getElementById("qr-code").innerHTML = event.data.payload.qrCode;
        document.getElementById("merchant").innerHTML = event.data.payload.merchant;
        document.getElementById("time").innerHTML = new Date().toDateString().slice(4) + ' ' + new Date().toLocaleTimeString();
        document.getElementById("transactionId").innerHTML = event.data.payload.transactionId;
        document.getElementById("amount").innerHTML = (event.data.payload.amount / 100).toFixed(2);
        document.getElementById("content").style.display = "block";
        document.getElementById("loader").style.display = "none";
      }
      if (event.data.status === 'jwtSuccess' || event.data.status === 'getIntentSuccess') {
        document.getElementById("error").style.display = "none";
      }
      if (event.data.status === 'error') {
        document.getElementById("loader").style.display = "block";
        document.getElementById("error").style.display = "block";
      }
      return true;
    } else {
      // The data was NOT sent from your site! 
      // Be careful! Do not use it. This else branch is
      // here just for clarity, you usually shouldn't need it.
      return;
    }
  } else {
    return;
  }
}