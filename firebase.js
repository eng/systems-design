function loadPage() {
  // grab all the products from firebase and add to DOM
  buildProducts()

  // set variables for all the dynamic elements
  let showSignInButton = document.querySelector('.show-sign-in')
  let closeSignInButton = document.querySelector('.close-sign-in')
  let signInButton = document.querySelector('.sign-in-button')
  let signUpButton = document.querySelector('.sign-up-button')
  let signOutButton = document.querySelector('.sign-out-button')
  
  // opens the sign-in form
  showSignInButton.addEventListener('click', function() {
    showSignInForm()
  })

  // closes the sign-in form
  closeSignInButton.addEventListener('click', function () {
    showSignInForm()
  })

  // sign-in button
  signInButton.addEventListener('click', handleSignIn)

  // sign-up button
  signUpButton.addEventListener('click', handleSignUp)

  // sign out button
  signOutButton.addEventListener('click', function() {
    firebase.auth().signOut()
  })

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      showSignInButton.classList.add('hidden')
      signOutButton.classList.remove('hidden')
    } else {
      showSignInButton.classList.remove('hidden')
      signOutButton.classList.add('hidden')
    }
  })
}

function buildProducts() {
  const db = firebase.firestore()
  db.collection('products').orderBy('name').get().then(function (documents) {
    documents.forEach(function (doc) {
      let productId = doc.id
      let product = doc.data()
      let productsContainer = document.querySelector('.products')
      productsContainer.insertAdjacentHTML('beforeend', `
      <div class="p-4 w-full md:w-1/2 lg:w-1/3">
        <div class="border h-full p-4 flex flex-col">
          <h2 class="text-lg font-bold mb-4">${product.name}</h2>
          <div class="mb-4"><img src="${product.image}"></div>
          <div class="mb-4 text-gray-900">${product.description}</div>
          <div class="mt-auto flex">
            <div class="text-purple-500 text-2xl">$${product.price}</div>
            <a href="#" data-product-id="${productId}" class="add-to-cart-button ml-auto px-4 py-2 text-white bg-purple-500 rounded">Add to cart</a>
          </div>
        </div>
      </div>
      `)
    })
    let addToCartButtons = document.querySelectorAll('.add-to-cart-button')
    for (let i=0; i<addToCartButtons.length; i++) {
      addToCartButtons[i].addEventListener('click', function(event) {
        event.preventDefault()
        addToCart(addToCartButtons[i].dataset.productId)
      })
    }
  })
}

function handleSignIn() {
  let email = document.querySelector('#email').value
  let password = document.querySelector('#password').value
  firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
    showSignInForm()
  }).catch(function(error) {
    alert(error.message)
  })
}

function handleSignUp() {
  let email = document.querySelector('#email').value
  let password = document.querySelector('#password').value
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
    showSignInForm()
  }).catch(function (error) {
    alert(error.message)
  })
}

function showSignInForm() {
  document.querySelector('.sign-in-form').classList.toggle('hidden')
}

function addToCart(productId) {
  if (firebase.auth().currentUser == null) {
    showSignInForm()
    return null
  }

  const db = firebase.firestore()
  db.collection('orders')
    .where('user', '==', firebase.auth().currentUser.uid)
    .where('complete', '==', false)
    .get()
    .then(function(orders) {
      if (orders.size == 0) {
        console.log('creating an order')
        db.collection('orders').add({
          user: firebase.auth().currentUser.uid,
          complete: false
        }).then(function(newOrder) {
          db.collection('items').add({
            order: newOrder.id,
            product: productId,
            quantity: 1
          })
        })
      } else {
        console.log('order exists')
        let orderId = orders.docs[0].id
        db.collection('items')
          .where('order', '==', orderId)
          .where('product', '==', productId)
          .get()
          .then(function(items) {
            if (items.size == 0) {
              console.log('no items for that order and product, creating')
              db.collection('items').add({
                order: orderId,
                product: productId,
                quantity: 1
              })
            } else {
              console.log('existing item for that order and product, incrementing quantity')
              db.collection('items').doc(items.docs[0].id).update({
                quantity: items.docs[0].data().quantity + 1
              })
            }
          })
      }
    })
}