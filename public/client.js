document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.getElementById('registerButton');
    const authenticateButton = document.getElementById('authenticateButton');

    registerButton.addEventListener('click', () => {
        register();
    });

    authenticateButton.addEventListener('click', () => {
        authenticate();
    });
});

function register() {
    if (!navigator.credentials) {
        alert('WebAuthn is not supported in this browser.');
        return;
    }

    // Generate a random challenge
    const challenge = generateRandomBuffer(32);

    // Make a registration request to the server
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge }),
    })
        .then((response) => response.json())
        .then((data) => {
            const { publicKey } = data;

            // Convert the base64-encoded public key into an ArrayBuffer
            const publicKeyArray = base64ToArrayBuffer(publicKey);

            // Convert the challenge into a UInt8Array
            const challengeArray = new Uint8Array(challenge);
            // Create the PublicKeyCredentialCreationOptions
            const options = {
                publicKey: {
                    rp: { name: 'Example WebAuthn App' },
                    user: {
                        id: publicKeyArray,
                        name: 'Mahmoud Saad',
                        displayName: 'Mahmoud Saad',
                    },
                    challenge: challengeArray,
                    pubKeyCredParams: [
                        { type: 'public-key', alg: -7 }, // ES256
                        { type: 'public-key', alg: -257 }, // RS256
                    ],
                    attestation: 'direct',
                },
            };
            // Call the WebAuthn API to create the credential
            return navigator.credentials.create(options);
        })
        .then((credential) => {
            // Update the publicKey property with the generated credential's publicKey
            const publicKeyArray = new Uint8Array(
                credential.response.attestationObject
            );

            // Convert the publicKey into a base64-encoded string
            const publicKey = arrayBufferToBase64(publicKeyArray);
            // Send the registration response to the server
            return fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge, publicKey }),
            });
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Registration successful:', data);
        })
        .catch((error) => {
            console.error('Registration failed:', error);
        });
}

function authenticate() {
    if (!navigator.credentials) {
        alert('WebAuthn is not supported in this browser.');
        return;
    }

    // Generate a random challenge
    const challenge = generateRandomBuffer(32);

    // Make an authentication request to the server
    fetch('/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge }),
    })
        .then((response) => response.json())
        .then((data) => {
            const { publicKey } = data;

            // Convert the base64-encoded public key into an ArrayBuffer
            const publicKeyArray = base64ToArrayBuffer(publicKey);

            // Convert the challenge into a UInt8Array
            const challengeArray = new Uint8Array(challenge);

            // Create the PublicKeyCredentialRequestOptions
            const options = {
                publicKey: {
                    challenge: challengeArray,
                    allowCredentials: [
                        {
                            id: publicKeyArray,
                            type: 'public-key',
                        },
                    ],
                },
            };

            // Call the WebAuthn API to get the assertion
            return navigator.credentials.get(options);
        })
        .then((assertion) => {
            // Send the authentication response to the server
            return fetch('/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: assertion.id,
                    response: assertion.response,
                }),
            });
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Authentication successful:', data);
        })
        .catch((error) => {
            console.error('Authentication failed:', error);
        });
}

function generateRandomBuffer(length) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return array.buffer;
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.btoa(base64);
    const length = binaryString.length;
    const buffer = new ArrayBuffer(length);
    const array = new Uint8Array(buffer);

    for (let i = 0; i < length; i++) {
        array[i] = binaryString.charCodeAt(i);
    }

    return buffer;
}

function arrayBufferToBase64(arrayBuffer) {
    const binary = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    return window.btoa(binary);
}
