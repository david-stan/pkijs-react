import * as asn1js from 'asn1js';
import ContentInfo from 'pkijs/src/ContentInfo';
import EnvelopedData from 'pkijs/src/EnvelopedData';


function setup_decryption(certIndex, privateKeyBuffer, cmsEnvelopedBuffer) {
    const asn1 = asn1js.fromBER(cmsEnvelopedBuffer);
    const cmsContentSimpl = new ContentInfo({schema: asn1.result});
    const cmsEnvelopedSimp = new EnvelopedData({schema: cmsContentSimpl.content});

    return cmsEnvelopedSimp.decrypt(
        certIndex,
        {
            recipientPrivateKey: privateKeyBuffer
        }).then(
            result => result,
            error => Promise.reject(`Error during decryption process: ${error}`)
    );
}

export default function decrypt(certIndex, privateKeyBuffer, cmsEnvelopedBuffer) {
    return Promise.resolve().then(() => {
        return setup_decryption(certIndex, privateKeyBuffer, cmsEnvelopedBuffer)
    })
    .then(result => result);
}