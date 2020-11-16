window.addEventListener('DOMContentLoaded', function() {
  fetch('https://api.airtable.com/v0/appcEdYdqWTVWe80T/Products?sort%5B0%5D%5Bfield%5D=Name', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer keyV4oqFP1aJ9oo7R'
    }
  })
  .then(function(response) {
    return response.json()
  })
  .then(function(json) {
    let records = json.records
    console.log(records)
    for (let i=0; i<records.length; i++) {
      let fields = records[i].fields
      let name = fields['Name']
      let description = fields['Description']
      let imageURL = fields['Image URL']
      let price = fields['Price']
      document.querySelector('.products').insertAdjacentHTML('beforeend', `
        <div class="p-4 w-full md:w-1/2 lg:w-1/3">
        <div class="border h-full p-4 flex flex-col">
          <h2 class="text-lg font-bold mb-4">${name}</h2>
          <div class="mb-4"><img src="${imageURL}"></div>
          <div class="mb-4 text-gray-900">${description}</div>
          <div class="mt-auto text-purple-500 text-2xl">$${price}</div>
        </div>
      </div>
      `)
    }
  })
})