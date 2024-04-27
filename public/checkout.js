// This is your test publishable API key.
const stripe = Stripe("pk_test_51NLFw4EHJOwgFJ93WSsJajLuEBwjbppVWn4RMJ6lGo95zJrEGPv16NnANRgbchJv3Fz3N66MAKVq2q9YqP3gCfbP00F1uKtMao");

const amountInput = document.getElementById('amount-input');

// Initialize elements and clientSecret globally to be accessible in all functions
let elements;
let clientSecret;

// Debounce function to limit the rate at which a function is called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}


// Debounced function to handle amount change
const debounceAmountChange = debounce(async (e) => {
    let amount = parseInt(e.target.value * 100); // Convert to the smallest currency unit, e.g., cents
    if (amount > 0) { // Ensure amount is greater than 0
        await initialize(amount); // Call initialize with the updated amount
    }
}, 500); // 500ms debounce time

amountInput.addEventListener('input', debounceAmountChange);


// Function to initialize Stripe elements with the amount
async function initialize(amount) {
    // Fetch clientSecret from your server, including the dynamically updated amount
    const response = await fetch("https://tutortree-1f6f9e7e11c7.herokuapp.com/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount }), // Pass the dynamically updated amount here
    });
    const { clientSecret } = await response.json();

    const appearance = { theme: 'stripe' };
    elements = stripe.elements({ appearance, clientSecret });

    const paymentElementOptions = {
        layout: "tabs",
    };

    const paymentElement = elements.create("payment", paymentElementOptions);
    paymentElement.mount("#payment-element");
}


var recipientID = '';
var recipientEmail = '';
var paymentMethod = 'card'


window.onload = function() {
  // Get the user ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userID');

  recipientID = userId
  if (userId) {
    const userRef = database.collection('users').doc(userId);
    userRef.get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        // Assuming the img tag for the photo has an ID 'photo-container'
        // and the header or div for the name has an ID 'name-header'
        let profilePhoto = document.createElement('img')
        profilePhoto.className = "deposit-profile-image"
        recipientEmail = userData.email
          
        if(userData.profileImage) {
            let profileContainer = document.getElementById('profile-container')
            while ( profileContainer.firstChild ) {
                profileContainer.removeChild(profileContainer.firstChild)
            }
            profilePhoto.src = userData.profileImage;
          profileContainer.appendChild(profilePhoto)
        }
        document.getElementById('name-header').textContent = `Deposit funds for ${userData.name}` ;
      } else {
        console.log("No such user!");
      }
    }).catch((error) => {
      console.log("Error getting user:", error);
    });
  }
}

document.addEventListener("DOMContentLoaded", function() {
    // Place initialization and event listener attachment code here
    checkStatus();
    document.querySelector("#payment-form").addEventListener("submit", handleSubmit);

});


async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

    const {error, paymentIntent} = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // This line instructs Stripe to redirect only if required by the payment method
      confirmParams: {
        // Optionally, specify a return_url for redirect-required payment methods
        // return_url: "your_return_url_here",
      },
    });

  if (error) {
    showMessage(error.message);
    setLoading(false);
  } else if (paymentIntent && paymentIntent.status === 'succeeded') {
    // Payment succeeded, now call your server-side function
    const depositData = {
      userID: recipientID,
      amount: paymentIntent.amount, // This is already in the smallest currency unit (e.g., cents for USD)
      userEmail: recipientEmail,
      transactionID: paymentIntent.id, // Assuming this is your transactionID
      paymentMethod: paymentMethod,
      date: Math.floor(new Date().getTime() / 1000) // Current timestamp in seconds
    };

    try {
      const response = await fetch('https://tutortree-1f6f9e7e11c7.herokuapp.com/depositFundsAndUpdateBalance', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(depositData),
      });
      const responseData = await response.json();

      if (response.ok && responseData.success) {
        // Handle success response
          showMessage('Payment succeeded! Their balance has been updated.');
          setLoading(false);
          // Hide the payment form and display the success message
          document.getElementById('payment-form').style.display = 'none';
          document.getElementById('amount-field-div').style.display = 'none';
          document.getElementById('payment-success').style.display = 'flex';

      } else {
        // Handle failure response
        showMessage(responseData.message || 'Failed to update balance.');
      }
    } catch (error) {
      console.error('Error calling depositFundsAndUpdateBalance:', error);
      showMessage('Error processing your deposit. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  } else {
    showMessage('An unexpected error occurred.');
    setLoading(false);
  }
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}
