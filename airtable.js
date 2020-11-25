// this object lets us know who is logged-in
let currentUser = {
  netlifyID: null,
  airtableID: null,
  email: null,
  name: null
}

// helper to check if no user is logged-in
function notLoggedIn() {
  return netlifyIdentity.currentUser() == null
}

// fill in the currentUser object
async function getCurrentUser() {
  // checks to see if there's an Airtable user with the Netlify ID
  let response = await fetch(`https://api.airtable.com/v0/appcEdYdqWTVWe80T/users?filterByFormula=%7BnetlifyID%7D%3D%27${netlifyIdentity.currentUser().id}%27`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer keyV4oqFP1aJ9oo7R',
      'Content-Type': 'application/json'
    }
  })
  let json = await response.json()

  if (json.records.length == 0) {
    // if not, create an Airtable user – createAirtableUser sets currentUser when done
    createAirtableUser()
  } else {
    // if yes, set the currentUser object from the existing data
    let user = netlifyIdentity.currentUser()
    currentUser = {
      netlifyID: user.id,
      airtableID: json.records[0].id,
      email: user.email,
      name: user.user_metadata.full_name
    }
  }
}

// creates Airtable user and sets currentUser
async function createAirtableUser() {
  let user = netlifyIdentity.currentUser()
  let userData = {
    records: [
      {
        fields: {
          name: user.user_metadata.full_name,
          netlifyID: user.id,
          email: user.email
        }
      }
    ]
  }

  let response = await fetch('https://api.airtable.com/v0/appcEdYdqWTVWe80T/users', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer keyV4oqFP1aJ9oo7R',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  let json = response.json()
  console.log(json)

  // after the Airtable user is created, set the currentUser object
  currentUser = {
    netlifyID: user.id,
    airtableID: json.id,
    email: user.email,
    name: user.user_metadata.full_name
  }
}

// builds the products from Airtable data
async function buildProducts() {
  let response = await fetch('https://api.airtable.com/v0/appcEdYdqWTVWe80T/products?sort%5B0%5D%5Bfield%5D=name', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer keyV4oqFP1aJ9oo7R',
      'Content-Type': 'application/json'
    }
  })
  let json = await response.json()
  let records = json.records

  for (let i = 0; i < records.length; i++) {
    let fields = records[i].fields
    let productId = records[i].id
    let name = fields.name
    let description = fields.description
    let imageURL = fields.imageURL
    let price = fields.price
    let productsContainer = document.querySelector('.products')
    productsContainer.insertAdjacentHTML('beforeend', `
    <div class="p-4 w-full md:w-1/2 lg:w-1/3">
      <div class="border h-full p-4 flex flex-col">
        <h2 class="text-lg font-bold mb-4">${name}</h2>
        <div class="mb-4"><img src="${imageURL}"></div>
        <div class="mb-4 text-gray-900">${description}</div>
        <div class="mt-auto flex">
          <div class="text-purple-500 text-2xl">$${price}</div>
          <a href="#" data-product-id="${productId}" class="add-to-cart-button ml-auto px-4 py-2 text-white bg-purple-500 rounded">Add to cart</a>
        </div>
      </div>
    </div>
    `)
  }
  attachAddToCartEventListeners()
}

// listen for button clicks on each of the "Add to Cart" buttons
function attachAddToCartEventListeners() {
  let addToCartButtons = document.querySelectorAll('.add-to-cart-button')
  for (let i = 0; i < addToCartButtons.length; i++) {
    let button = addToCartButtons[i]
    button.addEventListener('click', handleAddToCartButtonClicked)
  }
}

// when "Add to Cart" button clicked
function handleAddToCartButtonClicked(event) {
  event.preventDefault()
  if (notLoggedIn()) {
    netlifyIdentity.open()
  } else {
    addToCart(event.target.dataset.productId)
  }
}

function addToCart(productId) {
  // let currentOrder = findCurrentOrder()
  console.log(`Adding to cart... product with record ID ${productId}`)
}

// function findCurrentOrder() {
//   fetch(`https://api.airtable.com/v0/appcEdYdqWTVWe80T/orders?filterByFormula=AND(NOT(%7Bcompleted%7D)%2C%7BuserRecordID%7D+%3D+%27${currentUser.airtableID}%27)`, {
//     method: 'GET',
//     headers: {
//       'Authorization': 'Bearer keyV4oqFP1aJ9oo7R',
//       'Content-Type': 'application/json'
//     }
//   })
//   .then(response => response.json())
//   .then(json => {
//     if (json.records.length == 0) {
//       console.log('Order does not exist!')
//       createNewOrder()
//     } else {
//       console.log('Order exists!')
//     }
//   })
// }

// async function createNewOrder() {
//   let orderData = {
//     records: [
//       {
//         fields: {
//           user: 
//           netlifyID: user.id,
//           email: user.email
//         }
//       }
//     ]
//   }

//   let response = await fetch('https://api.airtable.com/v0/appcEdYdqWTVWe80T/users', {
//     method: 'POST',
//     headers: {
//       'Authorization': 'Bearer keyV4oqFP1aJ9oo7R',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(userData)
//   })
//   let json = response.json()
// }

// stuff to do when the page initially loads
window.addEventListener('DOMContentLoaded', function() {
  // builds the products
  buildProducts()

  // after user logs-in, set the currentUser object
  netlifyIdentity.on('login', function(user) {
    getCurrentUser()
  })
})