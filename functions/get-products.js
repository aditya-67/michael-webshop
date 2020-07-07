/*
 * This function loads product data and returns it for use in the UI.
 */
const products = [{
    "id": 1,
    "sku": "DEMO001",
    "name": "This Pretty Plant",
    "description": "Look at this pretty plant. Photo by Galina N on Unsplash.",
    "image": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&h=600&q=80",
    "amount": 1000,
    "currency": "USD"
  },
  {
    "id": 2,
    "sku": "DEMO002",
    "name": "Adventure Mug",
    "description": "We’re going on an adventure! Photo by Annie Spratt on Unsplash.",
    "image": "https://images.unsplash.com/photo-1454329001438-1752daa90420?auto=format&fit=crop&w=600&h=600&q=80",
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