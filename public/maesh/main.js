(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], function () {
      return factory(root);
    });
  } else if (typeof exports === "object") {
    module.exports = factory(root);
  } else {
    window.Maesh = factory(root);
  }
})(
  typeof global !== "undefined" ?
  global :
  typeof window !== "undefined" ?
  window :
  this,
  function (window) {
    "use strict";

    //
    // Variables
    //

    let jwt;

    // Default defaults
    var defaults = {
      method: "POST",
      url: "https://api.staging.maesh.io",
      refreshTokenURL: "https://ilovelamp.staging.maesh.io/refreshtoken",
      origin: "https://webshop-js.netlify.app",
      createJWT: {
        first: 'mutation { createJwt(refreshToken:"',
        second: '") { token refreshToken } }',
      },
      createIntent: {
        first: "mutation { createIntent ( input: { amount: ",
        second: ', currency: "',
        third: '", gotoUrl: "',
        fourth: '",  referenceCode: "',
        fifth: '" }) { intent { transactionId } sgqr merchant} }',
      },
      getIntent: {
        first: '{ getIntent( transactionId: "',
        second: '") { status gotoUrl}}',
      },
      timeout: 1000,
      refreshToken: "",
      maeshFrame: null,
      flag: false
    };

    //
    // Methods
    //

    /**
     * Feature test
     * @return {Boolean} If true, required methods and APIs are supported
     */
    var supports = function () {
      return (
        "fetch" in window &&
        "XMLHttpRequest" in window &&
        "JSON" in window
      );
    };

    /**
     * Merge two or more objects together. (OPTIONAL, if we need more options)
     * @private
     * @param   {Object}   objects  The objects to merge together
     * @returns {Object}            Merged values of defaults and options
     */
    var extend = function () {
      // Variables
      var extended = {};

      // Merge the object into the extended object
      var merge = function (obj) {
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            if (
              Object.prototype.toString.call(obj[prop]) === "[object Object]"
            ) {
              extended[prop] = extend(extended[prop], obj[prop]);
            } else {
              extended[prop] = obj[prop];
            }
          }
        }
      };

      // Loop through each object and conduct a merge
      for (var i = 0; i < arguments.length; i++) {
        var obj = arguments[i];
        merge(obj);
      }

      return extended;
    };

    /**
     * Construct body for requests
     * @private
     * @param {String} type Type of Request
     * @param {Object} data  A set of values for creating the body [optional]
     * @return {Object}      An object for request payload
     */
    var createBody = function (type, data = {}) {
      let body = {};
      if (type === "createJwt") {
        body["query"] =
          defaults.createJWT.first +
          data.refreshToken +
          defaults.createJWT.second;
      }
      if (type === "createIntent") {
        body["query"] =
          defaults.createIntent.first +
          data.amount +
          defaults.createIntent.second +
          data.currency +
          defaults.createIntent.third +
          data.gotoUrl +
          defaults.createIntent.fourth +
          data.referenceCode +
          defaults.createIntent.fifth;
      }
      if (type === "getIntent") {
        body["query"] =
          defaults.getIntent.first +
          data.transactionId +
          defaults.getIntent.second;
      }
      return body;
    };

    /**
     * Send message to IFrame
     */
    var corsFunction = function (message) {
      defaults.maeshFrame.contentWindow.postMessage(message, defaults.origin);
    }

    /**
     * Create a component
     * @param {Object} data Data provided to create() method
     */
    var createMaesh = function (data) {
      sessionStorage.removeItem('maesh_one');
      sessionStorage.removeItem('maesh_two');
      var ifrm = document.createElement("iframe");
      ifrm.setAttribute("id", "maesh-iframe");
      document.getElementById(data.dom_element_id).appendChild(ifrm);
      ifrm.setAttribute("style", "border:none; width: 100%;width: -moz-available;width: -webkit-fill-available;width: fill-available; height: 100%; height: -moz-available; height: -webkit-fill-available; height: fill-available;");
      ifrm.setAttribute("src", defaults.origin + "/maesh/load_files.html?api_key=" + data.api_key);
      var isMobile = /iPhone|iPad|iPod|webOS|Android|BlackBerry|Windows Phone/i.test(navigator.userAgent);

      addEventListener("load", function () {
        setTimeout(frameLoad, 0);
      }, false);

      function frameLoad() {
        defaults.maeshFrame = document.getElementById('maesh-iframe');
        if (isMobile) {
          corsFunction({
            status: 'isMobile'
          })
        } else {
          corsFunction({
            status: 'notMobile'
          })
        }
        refresh(data);
      }

    };

    /**
     * Refresh Token (TO BE DEPRECATED)
     * @return  Refresh Token
     */

    var refresh = function (data) {
      fetch(defaults.refreshTokenURL, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Origin: "local."
          },
          body: JSON.stringify({
            key: data.api_key,
            type: 'merchant'
          }),
        })
        .then((response) => response.json())
        .then((json) => {
          if (json["status"] === "success") {
            corsFunction({
              status: 'jwtSuccess'
            });
            data["refreshToken"] = json["refreshToken"];
            transaction(data);
          } else {
            throw new Error("Invaild Reponse");
          }
        })
        .catch((e) => {
          corsFunction({
            status: 'error'
          });
        })
    };


    /**
     * Create a transaction
     * @private
     * @param   {Object}   data  Object with data to send requests
     */
    async function transaction(data) {
      await fetch(defaults.url, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(createBody("createJwt", data)),
        })
        .then(async (response) => await response.json())
        .then((json) => {
          if (json["errors"]) {
            corsFunction({
              status: 'error'
            });
          }
          jwt = json["data"]["createJwt"]["token"];
          sessionStorage.setItem('maesh_one', jwt)
          fetch(defaults.url, {
              method: "POST",
              headers: {
                "Content-type": "application/json",
                Authorization: "JWT " + json["data"]["createJwt"]["token"],
                "User-Agent": "local/v1",
                Origin: "local.",
                Accept: "application/javascript",
              },
              body: JSON.stringify(createBody("createIntent", data)),
            })
            .then((response) => response.json())
            .then((json) => {
              if (json["errors"]) {
                corsFunction({
                  status: 'error'
                })
              }
              sessionStorage.setItem(
                'maesh_two',
                json['data']['createIntent']['intent']['transactionId']
              )
              corsFunction({
                status: 'createIntentSuccess',
                payload: {
                  qrCode: json["data"]["createIntent"]["sgqr"],
                  transactionId: json["data"]["createIntent"]["intent"]["transactionId"],
                  amount: data.amount,
                  merchant: json["data"]["createIntent"]["merchant"]
                }
              });
              status(
                json["data"]["createIntent"]["intent"]["transactionId"],
                jwt
              );
            })
            .catch((e) => corsFunction({
              status: 'error'
            }));
        })
        .catch((e) => corsFunction({
          status: 'error'
        }));
    }

    /**
     * Check status of Payment
     * @private
     * @param {String} transaction_id Transaction ID
     * @param {String} token JWT token to authorise the request
     */

    var status = function (transaction_id, token) {
      fetch(defaults.url, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "JWT " + token,
          },
          body: JSON.stringify(
            createBody("getIntent", {
              transactionId: transaction_id
            })
          ),
        })
        .then((response) => response.json())
        .then((json) => {
          if (json["errors"]) {
            throw new Error("Expired");
          }
          if (json["data"]["getIntent"]["status"] === "Unpaid") {
            corsFunction({
              status: 'getIntentSuccess'
            })
            setTimeout(function () {
              status(transaction_id, token);
            }, defaults.timeout);
          } else {
            window.location.replace(json["data"]["getIntent"]["gotoUrl"]);
          }
        })
        .catch((e) => corsFunction({
          status: 'error'
        }));
    };

    async function handleCallback() {
      // Default defaults

      const transaction_id = sessionStorage.getItem('maesh_two')
      const token = sessionStorage.getItem('maesh_one')

      try {
        const response = await fetch(defaults.url, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            Authorization: 'JWT ' + token
          },
          body: JSON.stringify(
            createBody('getIntent', {
              transactionId: transaction_id
            })
          )
        })
        const json = await response.json()

        sessionStorage.removeItem('maesh_one')
        sessionStorage.removeItem('maesh_two')
        if (json['errors']) {
          throw new Error('Invalid')
        }
        return json['data']['getIntent']['status']
      } catch (e) {
        return 'Error'
      }
    }


    /**
     * Instatiate Maesh
     * @param {String} url      The request URL
     * @param {Object} options  A set of options for the request [optional]
     */

    var Maesh = function () {
      // Check browser support
      if (!supports())
        throw "Maesh: This browser does not support the methods used in this plugin.";

      return {
        create: createMaesh,
        callback: handleCallback
      };
    };

    //
    // Public Methods
    //

    return Maesh;
  }
);