import { toBase64, arrayBufferToString, stringToArrayBuffer } from 'pvutils';

export function formatPEM(pemString) {
    const PEM_STRING_LENGTH = pemString.length, LINE_LENGTH = 64;
    const wrapNeeded = PEM_STRING_LENGTH > LINE_LENGTH;

    if (wrapNeeded) {
        let formattedString = "", wrapIndex = 0;

        for (let i = LINE_LENGTH; i < PEM_STRING_LENGTH; i += LINE_LENGTH) {
            formattedString += pemString.substring(wrapIndex, i) + "\r\n";
            wrapIndex = i;
        }

        formattedString += pemString.substring(wrapIndex, PEM_STRING_LENGTH);
        return formattedString;
    } else {
        return pemString;
    }
}

export function formatCertificateBuffer(buffer) {
    const certificateString = String.fromCharCode.apply(null, new Uint8Array(buffer));

    let resultStringCert = "-----BEGIN CERTIFICATE-----\r\n";
    resultStringCert = `${resultStringCert}${formatPEM(window.btoa(certificateString))}`; //base64 encoding
    resultStringCert = `${resultStringCert}\r\n-----END CERTIFICATE-----\r\n`;

    return resultStringCert
}

export function formatPrivateKeyBuffer(buffer) {
    const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(buffer));

    let resultStringPrivateKey = "-----BEGIN PRIVATE KEY-----\r\n";
    resultStringPrivateKey = `${resultStringPrivateKey}${formatPEM(window.btoa(privateKeyString))}`; //base64 encoding
    resultStringPrivateKey = `${resultStringPrivateKey}\r\n-----END PRIVATE KEY-----\r\n`;

    return resultStringPrivateKey
}

export function formatEncryptedBuffer(buffer) {
    let resultString = "-----BEGIN CMS-----\r\n";
    resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(buffer)))}`; //base64 encoding
    resultString = `${resultString}\r\n-----END CMS-----\r\n`;

    return resultString
}

export function pkcs8ToArrayBuffer(pkcsString) {
    const clearPrivateKey = pkcsString.replace(/(-----(BEGIN|END)( NEW)? PRIVATE KEY-----|\n)/g, "");
    return stringToArrayBuffer(window.atob(clearPrivateKey));
}