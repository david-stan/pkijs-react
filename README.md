
## Available Scripts

First run 

### `npm install`

, for pkijs and its dependencies.

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

Navigate between encryption and decryption tools in the navbar.

### `Encryption Tool`

Enables generation of two x509 certificates and their correnspondent pkcs#8 private keys, which are later used for encryption and decryption.
Also, there are options (buttons) for upload, encryption and download of encrypted file as application/octet-stream, as well as their statuses of completion.

### `Decryption Tool`

Enables decryption of a CMS Enveloped file using appropriate private key and its correspondent recipient index, which is chosen by dropdown element.
Furthermore, there are options for the upload of encrypted octet-stream file, decryption and download of decrypted file with its original mime-type.
