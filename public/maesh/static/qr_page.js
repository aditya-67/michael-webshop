//Make request to Maesh server to get Intent
$( document ).ready(function makeRequest() {

    let query = '{getIntent( transactionId: "'+transaction_id+'") { status redirectUri}}';
    $.ajax({
        url: api_url,
        data: JSON.stringify({'query':''+query}),
        method: "POST",
        contentType: "application/json",
        headers: {
              	'Authorization': 'JWT '+token,
        },
        success: function(response) {
            //If the response has errors, the signature expired, so the qr page expired
            if (response['errors']) {
                window.location.href = '/qr_expired';
            } else {
                if (response['data']['getIntent']['status'] === 'Unpaid') {
                    setTimeout(makeRequest, 1000); //recursive call every 1 second
                } else {
                    window.location.replace(response['data']['getIntent']['redirectUri'])  
                }
            }
        },
        error: function (request, status, error) {
            window.location.href = '/qr_expired';
        }
    });
});

// let content = 
//             `query getIntent {
//             getIntent(transactionId:"ad7cf896e587b") {
//                 status
//                 redirectUri
//             }
//         }
//         `	

// var fetchNow = function() {
//     fetch(api_url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'JWT '+token,
//             'Origin': 'ilovelamp.staging.maesh.io',
//             'User-Agent': 'staging/v1',
//         },
//         body: JSON.stringify({'query':''+content})
//         })
//         .then((response) => response.json())
//         .then((data) => {
//             if (data.errors) {
//                 console.log('Fetch Error:', data.errors[0].message);
//                 document.getElementById("sgqr").outerHTML = "<div style=\'padding: 10px;\'><strong>Scan QR & Pay</strong> is currently not available</div><div>Powered by Maesh</div>";
//             } else {
//                 if (data.data.getIntent.status === 'Unpaid') {
//                     setTimeout(fetchNow, 1000);
//                 } else {                    
//                     window.location.replace(data.data.getIntent.redirectUri)  
//                 }
//             }
//         })
//         .catch(function(error) {
//                 document.getElementById("sgqr").outerHTML = "<div style=\'padding: 10px;\'><strong>Scan QR & Pay</strong> is currently not available</div><div>Powered by Maesh</div>";
//             console.log('Fetch Error:', error);
//         });
//     };
//     fetchNow();