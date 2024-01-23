import { navto } from "../index.js"

let imgFile = undefined

function avatarButtonFunction()
{
  const input = document.getElementById("newAvatar");
  input.addEventListener("change", function() {

    const file = input.files[0]

    if (file)
    {
      const reader = new FileReader()

      reader.onload = function (e) {
        const img = new Image()
        img.src = e.target.result;

        img.onload = function () {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let targetSize = 150

          const scaleFactor = Math.min(targetSize / img.width, targetSize / img.height);

          canvas.width = targetSize
          canvas.height = targetSize

          const scaledWidth = img.width * scaleFactor;
          const scaledHeight = img.height * scaleFactor;

          const offsetX = img.width > img.height ? (img.width - img.height) / 2 : 0;
          const offsetY = img.height > img.width ? (img.height - img.width) / 2 : 0;

          ctx.drawImage(img, offsetX, offsetY, Math.min(img.width, img.height), Math.min(img.width, img.height), 0, 0, targetSize, targetSize);

          const croppedDataURL = canvas.toDataURL('image/png');
          imgFile = croppedDataURL;
          document.getElementById('avatar_preview').src = croppedDataURL;
        }
      }
      reader.readAsDataURL(file);
    }
  });
}

export function initUpdateAccount()
{
  avatarButtonFunction() //TO CHANGE

  let submitBtn = document.getElementsByClassName("submit_BTN")[0];
  submitBtn.addEventListener("click", updateAccount)
  let inputArray = document.querySelectorAll("input");
  inputArray.forEach((input) => {
    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitBtn.click();
      }
    })
  })
  inputArray[1].focus()
}

function updateAccount(event)
{
  event.preventDefault()

  let formData = new FormData();
  formData.append('newUsername', document.getElementById('Input_new_usr').value);
  formData.append('newEmail', document.getElementById('Input_new_mail').value);
  formData.append('newPassword', document.getElementById('Input_new_pwd').value);
  formData.append('newPasswordConfirmation', document.getElementById('Input_new_confirm_pwd').value);
  formData.append('password', document.getElementById('Input_pwd').value);

  if (imgFile != undefined)
  {
    formData.append('newAvatar', dataURItoBlob(imgFile));
  }

  var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
  let feedback = document.querySelector('.feedback')
  var headers = new Headers()
  headers.append('X-CSRFToken', crsf_token)

  fetch(document.location.origin + "/userManagement/updateAccount",
    {
      method: 'POST',
      headers: headers,
      body: formData,
    })
    .then(Response =>
      {
        if (!Response.ok)
        {
          throw new Error('Network response was not okay')
        }
        return Response.json()
      })
      .then(data =>
        {
          if (data.message)
          {
            feedback.style.color = "green"
            feedback.innerHTML = data.message
            navto("authApp/login")
          }
          else
          {
            feedback.style.color = "red"
            feedback.innerHTML = data.error
          }
        })
      .catch(error =>
        {
          console.error('Error:', error)
          feedback.innerHTML = data.message
          return
        })
}

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
