function convertStringToArrayBufferView(str)
{
    var bytes = new Uint8Array(str.length);
    for (var iii = 0; iii < str.length; iii++)
    {
        bytes[iii] = str.charCodeAt(iii);
    }

    return bytes;
}

function convertArrayBufferViewtoString(buffer)
{
    var str = "";
    for (var iii = 0; iii < buffer.byteLength; iii++)
    {
        str += String.fromCharCode(buffer[iii]);
    }

    return str;
}

var crypto = window.crypto || window.msCrypto;

var key_object = null;

var promise_key = null;

//var data = "SecretSquirrel";
//var data = document.getElementById("top_secret_1").value;
var data = null;

var encrypted_data = null;
var encrypt_promise = null;

//var vector = crypto.getRandomValues(new Uint8Array(16));
var vector = null;

function getSecret() {
  console.log("User submitted a secret");
  //var secretPass = "This is a really long sentence that should really not be this long, but hey, whatcha gonna do?";
  if(!document.getElementById("top_secret_1").value || document.getElementById("top_secret_1").value === ""){
      console.log("Must have data to encrypt");
      return;
  }
  data = document.getElementById("top_secret_1").value;
  console.log("Data is " + data);
  var secretPass = document.getElementById("password_1").value;
  console.log("Secret pass is " + secretPass);
  var secretDigest_promise = crypto.subtle.digest('SHA-256', convertStringToArrayBufferView(secretPass));
  secretDigest_promise.then(function(secretDigest){
    console.log("Digest type is: " + secretDigest);
    console.log("Digest is: '" + convertArrayBufferViewtoString(secretDigest) + "' with length of " + secretDigest.byteLength);
    rightsizeDigest = secretDigest.slice(0,16);
    console.log("Digest type is: " + rightsizeDigest);
    console.log("Digest is: '" + convertArrayBufferViewtoString(rightsizeDigest) + "' with length of " + rightsizeDigest.byteLength);
    vector = rightsizeDigest;
  });

  var decrypt_promise = null;
  var decrypted_data = null;

  if(crypto.subtle){
      console.log("Generating encryption key...");
      promise_key = crypto.subtle.generateKey({name: "AES-GCM", length: 128}, false, ["encrypt", "decrypt"]);

      console.log("Encrypting data...");
      var secretData = null;
      promise_key.then(function(key){
          key_object = key;
          encrypt_data();
      });

      promise_key.catch = function(e){
          console.log(e.message);
      }
      
      console.log("Decrypting data...");

  }
  else
  {
      alert("Cryptography API not Supported");
  }
  return false;
}

function encrypt_data(){
    encrypt_promise = crypto.subtle.encrypt({name: "AES-GCM", iv: vector}, key_object, convertStringToArrayBufferView(data));

    encrypt_promise.then(
        function(result){
            encrypted_data = new Uint8Array(result);
            console.log("Got encrypted data back, with length of " + encrypted_data.length);
            console.log("Decryptying data with the password...");
            decrypt_data();
        },
        function(e){
            console.log(e.message);
        }
    );
}

function decrypt_data()
{
    decrypt_promise = crypto.subtle.decrypt({name: "AES-GCM", iv: vector}, key_object, encrypted_data);

    decrypt_promise.then(
        function(result){
            decrypted_data = new Uint8Array(result);
            console.log("Decrypted value is: " + convertArrayBufferViewtoString(decrypted_data));
        },
        function(e){
            console.log(e.message);
        }
    );
}
