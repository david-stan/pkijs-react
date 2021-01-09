import * as asn1js from 'asn1js'
import Certificate from 'pkijs/src/Certificate';
import CertificateSet from 'pkijs/src/CertificateSet';
import ContentInfo from 'pkijs/src/ContentInfo';
import EnvelopedData from 'pkijs/src/EnvelopedData';
import OriginatorInfo from 'pkijs/src/OriginatorInfo';

let cmsEnvelopedBuffer = new ArrayBuffer(0);
//let valueBuffer = new ArrayBuffer(0);

const oaepHashAlgorithm = "SHA-1"
const encAlg = {
    name: "AES-CBC",
    length: 128
};

function setupEncryption(certificateBuffer, certificateBuffer2, valueBuffer) {
    const asn1 = asn1js.fromBER(certificateBuffer);
    const certSimpl = new Certificate({schema: asn1.result});

    const asn11 = asn1js.fromBER(certificateBuffer2);
    const certSimpl2 = new Certificate({schema: asn11.result});

    const cmsEnveloped = new EnvelopedData({
        originatorInfo: new OriginatorInfo({
            certs: new CertificateSet({
                certificates: [certSimpl, certSimpl2]
            })
        })
    });

    cmsEnveloped.addRecipientByCertificate(certSimpl, {oaepHashAlgorithm: oaepHashAlgorithm});
    cmsEnveloped.addRecipientByCertificate(certSimpl2, {oaepHashAlgorithm: oaepHashAlgorithm});

    return cmsEnveloped.encrypt(encAlg, valueBuffer)
        .then(() => {
            const cmsContentSimpl = new ContentInfo();
            cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
            cmsContentSimpl.content = cmsEnveloped.toSchema();

            cmsEnvelopedBuffer = cmsContentSimpl.toSchema().toBER(false);
        }, error => Promise.reject(`ERROR DURING ENCRYPTION PROCESS: ${error}`));
}

export default function encrypt(certificateBuffer, certificateBuffer2, valueBuffer) {
    return Promise.resolve()
        .then(() => {
            return setupEncryption(certificateBuffer, certificateBuffer2, valueBuffer)
        })
        .then(() => {
            return cmsEnvelopedBuffer;
        })
}