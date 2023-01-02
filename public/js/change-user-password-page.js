var token                 = ( new URL(document.location) ).searchParams.get('token')
var msgAlert              = document.getElementById('msgAlert')
var msgAlertText          = document.getElementById('statusMessage')
var pageBody              = document.getElementsByTagName('body').item(0)
var form                  = document.getElementById('signupForm')
var formContainer         = document.getElementById('formContainer')
var noTokenDiv            = document.getElementById('noTokenDiv')
var inputPassword         = document.getElementById("password")
var inputConfirmPassword  = document.getElementById("confirmPassword")
var submitButton          = document.getElementById('submitButton')
var loaderEffect          = document.getElementById('loader')

pageBody.onload               = checkToken
inputPassword.onchange        = validatePassword
inputConfirmPassword.onkeyup  = validatePassword
form.onsubmit                 = ( submitEvent ) => { validateSignupForm( submitEvent ) }

enableSubmitButton();


function checkToken() {
  if ( token ) {
    formContainer.style.display = "block"
    noTokenDiv.style.display = "none"
  }
  else {
    formContainer.style.display = "none"
    noTokenDiv.style.display = "block"
  }
}

function validatePassword() {
  
  if ( inputPassword.value != inputConfirmPassword.value ) {
    inputConfirmPassword.setCustomValidity("Passwords are different!")
    return false
  }
  else {
    inputConfirmPassword.setCustomValidity('')
    return true
  }

}

function enableSubmitButton() {
  submitButton.disabled = false
  loaderEffect.style.display = 'none'
}

function disableSubmitButton() {
  submitButton.disabled = true
  loaderEffect.style.display = 'unset'
}

function validateSignupForm( submitEvent ) {
  
  submitEvent.preventDefault()

  if ( !validatePassword() ) {
    return false;
  }
  
  onSignup();

}

async function onSignup() {
  try {
    let axiosResponse
    let reqBody = {
      token: token,
      password: inputPassword.value
    }

    disableSubmitButton()
    axiosResponse = await axios.post('/api/user/reset-password', reqBody)

    msgAlert.style.display = 'block'
    msgAlert.classList.remove('msg-alert-error')
    msgAlert.classList.add('msg-alert-success')
    msgAlertText.innerText = axiosResponse.data.message
  }
  catch (e) {

    msgAlert.style.display = 'block'
    msgAlert.classList.remove('msg-alert-success')
    msgAlert.classList.add('msg-alert-error')
        
    if ( e.name == 'AxiosError' ) {
      msgAlertText.innerText = `Unexpected error:\n${ e.response.status } ${ e.response.statusText }\n${ e.request.response }`
    }
    else {
      msgAlertText.innerText = `Unexpected error:\n${ e }`
    }

  }
  finally {
    setTimeout( () => { enableSubmitButton() }, 300 )
  }
}