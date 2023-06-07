const express = require('express');
const crypto = require('crypto');

const {
    generateRandomBuffer,
    base64ToArrayBuffer,
    convertArrayBufferToPEM,
} = require('./utils');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

const registeredCredentials = [];

app.post('/register', (req, res) => {
    const { challenge, publicKey } = req.body;

    // Generate a new credential ID
    const credentialId = generateRandomBuffer(16);

    registeredCredentials.push({
        credentialId: credentialId,
        publicKey: {
            ...publicKey,
            user: {
                id: credentialId,
                name: 'Mahmoud Saad',
                displayName: 'Mahmoud Saad',
            },
        },
    });

    // Generate a registration response
    const response = {
        publicKey: {
            challenge,
            rp: { name: 'Example WebAuthn App' },
            user: {
                id: credentialId,
                name: 'Mahmoud Saad',
                displayName: 'Mahmoud Saad',
            },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
            authenticatorSelection: { authenticatorAttachment: 'platform' },
            attestation: 'direct',
        },
    };

    res.json(response);
});

app.post('/authenticate', (req, res) => {
    const { id, response } = req.body;
    // Find the registration data for the provided credential ID
    const registeredCredential = registeredCredentials.find(
        (credential) =>
            credential.publicKey.user && credential.publicKey.user.id === id
    );

    if (!registeredCredential) {
        return res.status(404).json({ error: 'Credential not found' });
    }

    // Verify the received authentication response
    const { authenticatorData, clientDataJSON, signature } = response;

    // Perform null checks before accessing nested properties
    if (!authenticatorData || !clientDataJSON || !signature) {
        return res.status(400).json({ error: 'Invalid authentication response' });
    }

    // Convert base64-encoded data to ArrayBuffer
    const signatureArray = base64ToArrayBuffer(signature);

    const publicKey = registeredCredential.publicKey;

    // Convert public key to ArrayBuffer
    const publicKeyArrayBuffer = base64ToArrayBuffer(publicKey);

    // Convert ArrayBuffer to PEM format
    const publicKeyPEM = convertArrayBufferToPEM(
        publicKeyArrayBuffer,
        'PUBLIC KEY'
    );

    // Verify the signature
    const verify = crypto.createVerify('sha256');
    verify.write(Buffer.from(clientDataJSON));
    verify.end();

    const verification = verify.verify(
        publicKeyPEM,
        Buffer.from(signatureArray),
        'base64'
    );

    if (!verification) {
        return res.status(401).json({ error: 'Authentication failed' });
    }

    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
