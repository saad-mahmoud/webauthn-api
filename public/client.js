const challengeBuffer = new Uint8Array([
    0x8c, 0x0a, 0x26, 0xff, 0x22, 0x91, 0xc1, 0xe9, 0xb9, 0x4e, 0x2e, 0x17, 0x1a,
    0x98, 0x6a, 0x73, 0x71, 0x9d, 0x43, 0x48, 0xd5, 0xa7, 0x6a, 0x15, 0x7e, 0x38,
    0x94, 0x52, 0x77, 0x97, 0x0f, 0xef,
]).buffer;

let userIdBuffer = new Uint8Array([
    0x79, 0x50, 0x68, 0x71, 0xda, 0xee, 0xee, 0xb9, 0x94, 0xc3, 0xc2, 0x15, 0x67,
    0x65, 0x26, 0x22, 0xe3, 0xf3, 0xab, 0x3b, 0x78, 0x2e, 0xd5, 0x6f, 0x81, 0x26,
    0xe2, 0xa6, 0x01, 0x7d, 0x74, 0x50,
]).buffer;

const options = {
    publicKey: {
        rp: { name: 'Example WebAuthn App' },
        user: {
            id: userIdBuffer,
            name: 'Felix',
            displayName: 'Felix',
        },
        challenge: challengeBuffer,
        pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
        ],
        attestation: 'direct',
        authenticatorSelection: { authenticatorAttachment: 'platform' },
    },
};

const registerButton = document.getElementById('registerButton');
registerButton.addEventListener('click', () => {
    navigator.credentials.create(options)
        .then((cred) => {
            console.log('NEW CREDENTIAL', cred);
            console.log('userIdBuffer', userIdBuffer);
            userIdBuffer = new Uint8Array(cred.response.attestationObject);
            console.log('userIdBuffer', userIdBuffer);
            console.log('cred.response.clientDataJSON', cred.response.clientDataJSON);
            console.log('cred.rawId', new Int32Array(cred.rawId));

            const idList = [
                {
                    id: cred.rawId,
                    transports: ['ble', 'hybrid', 'internal', 'nfc', 'usb'],
                    type: 'public-key',
                },
            ];

            // Store idList or perform necessary actions

        })
        .catch((err) => {
            console.log('ERROR', err);
        });
});

const authenticateButton = document.getElementById('authenticateButton');
authenticateButton.addEventListener('click', () => {
    const getCredentialDefaultArgs = {
        publicKey: {
            timeout: 60000,
            challenge: new Uint8Array([
                0x79, 0x50, 0x68, 0x71, 0xda, 0xee, 0xee, 0xb9, 0x94, 0xc3, 0xc2, 0x15, 0x67,
                0x65, 0x26, 0x22, 0xe3, 0xf3, 0xab, 0x3b, 0x78, 0x2e, 0xd5, 0x6f, 0x81, 0x26,
                0xe2, 0xa6, 0x01, 0x7d, 0x74, 0x50,
            ]).buffer,
        },
    };

    navigator.credentials.get(getCredentialDefaultArgs)
        .then((response) => {
            console.log(response);
            // Perform necessary actions with the response
        })
        .catch((err) => {
            console.log('ERROR', err);
        });
});
