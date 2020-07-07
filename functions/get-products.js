/*
 * This function loads product data and returns it for use in the UI.
 */
const products = [{
    "id": 1,
    "sku": "DEMO001",
    "name": "This Pretty Plant",
    "description": "Look at this pretty plant.",
    "image": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&h=600&q=80",
    "amount": 1000,
    "currency": "USD"
  },
  {
    "id": 2,
    "sku": "DEMO002",
    "name": "Not so Pretty Plant",
    "description": "A Throny experience.",
    "image": "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&h=600&q=80",
    "amount": 1500,
    "currency": "USD"
  }
]

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};