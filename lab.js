function buildProducts(json) {
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

  buildAddToCartButtons()
}

function buildAddToCartButtons() {
  let addToCartButtons = document.querySelectorAll('.add-to-cart-button')
  for (let i = 0; i < addToCartButtons.length; i++) {
    let button = addToCartButtons[i]
    button.addEventListener('click', handleAddToCartButtonClicked)
  }
}

function handleAddToCartButtonClicked(event) {
  event.preventDefault()
  if (netlifyIdentity.currentUser() == null) {
    netlifyIdentity.open()
  } else {
    let user = netlifyIdentity.currentUser()
    fetch(`https://api.airtable.com/v0/appcEdYdqWTVWe80T/users?filterByFormula=%7BnetlifyID%7D%3D%27${user.id}%27`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer keyV4oqFP1aJ9oo7R',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(json => {
      if (json.records.length == 0) {
        createUser(json)
      } else {
        console.log('User already exists!')
      }
      addToCart(event.target.dataset.productId)
    })
  }
}

function createUser(json) {
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

  fetch('https://api.airtable.com/v0/appcEdYdqWTVWe80T/users', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer keyV4oqFP1aJ9oo7R',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  .then(response => response.json())
  .then(() => console.log('User created!'))
}

function addToCart(productId) {
  console.log(productId)
}

window.addEventListener('DOMContentLoaded', function() {
  fetch('https://api.airtable.com/v0/appcEdYdqWTVWe80T/products?sort%5B0%5D%5Bfield%5D=name', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer keyV4oqFP1aJ9oo7R',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(json => buildProducts(json))
})