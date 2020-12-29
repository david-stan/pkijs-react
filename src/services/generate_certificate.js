import * as asn1js from 'asn1js';

import Certificate from 'pkijs/src/Certificate';
import AttributeTypeAndValue from 'pkijs/src/AttributeTypeAndValue';
import Extension from 'pkijs/src/Extension';
import BasicConstraints from 'pkijs/src/BasicConstraints';
import { getCrypto, getAlgorithmParameters } from 'pkijs/src/common';
import ExtKeyUsage from 'pkijs/src/ExtKeyUsage';
import CertificateTemplate from 'pkijs/src/CertificateTemplate';
import CAVersion from 'pkijs/src/CAVersion';


let certificateBuffer = new ArrayBuffer(0);
let privateKeyBuffer = new ArrayBuffer(0);
let trustedCertificates = [];

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";

function SetupNewCertificate() {
    let setup_promise = Promise.resolve();

    const certificate = new Certificate();
    const crypto = getCrypto();
    if (typeof crypto === "undefined") {
        return Promise.reject("No WebCrypto extension found");
    }

    let publicKey;
    let privateKey;

    trustedCertificates = []

    certificate.version = 2;
    certificate.serialNumber = new asn1js.Integer({value:1});
    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.6",
        value: new asn1js.PrintableString({value: "BA"})
    }));
    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.3",
        value: new asn1js.BmpString({value: "CN_1"})
    }));
    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.6",
        value: new asn1js.PrintableString({value: "BA"})
    }));
    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.3",
        value: new asn1js.BmpString({value: "CN_1"})
    }));

    certificate.notBefore.value = new Date();
    certificate.notAfter.value = new Date(2023, 12, 29);

    certificate.extensions = []

    const basicConstraints = new BasicConstraints({
        cA: true,             //is this certificate an CA certificate
        pathLenConstraint: 3  //number of allowed sub-ca certificates in the chain
    });

    certificate.extensions.push(new Extension({
        extnID: "2.5.29.19",
        critical: true,
        extnValue: basicConstraints.toSchema().toBER(false),
        parsedValue: basicConstraints
    }));

    const bitArray = new ArrayBuffer(1);
    const bitView = new Uint8Array(bitArray);

    //set KeyUsage extension byte which indicates the purpose for 
    //which the certified public key is used - (keyCertSign & cRLSign)
    bitView[0] |= 0x02; // 0b00000010 |
    bitView[0] |= 0x04; // 0b00000100 -> 0b00000110

    const keyUsage = new asn1js.BitString({valueHex: bitArray});

    certificate.extensions.push(new Extension({
        extnID: "2.5.29.15",
        critical: false,
        extnValue: keyUsage.toBER(false),
        parsedValue: keyUsage
    }));

    const extKeyUsage = new ExtKeyUsage({
        keyPurposes: [
            "2.5.29.37.0",            // anyExtendedKeyUsage
            "1.3.6.1.5.5.7.3.1",      // id-kp-serverAuth
            "1.3.6.1.5.5.7.3.2",      // id-kp-clientAuth
            "1.3.6.1.5.5.7.3.3",      // id-kp-codeSigning
            "1.3.6.1.5.5.7.3.4",      // id-kp-emailProtection
            "1.3.6.1.5.5.7.3.8",      // id-kp-timeStamping
            "1.3.6.1.5.5.7.3.9",      // id-kp-OCSPSigning
            "1.3.6.1.4.1.311.10.3.1", // Microsoft Certificate Trust List signing
            "1.3.6.1.4.1.311.10.3.4"  // Microsoft Encrypted File System
        ]
    });

    certificate.extensions.push(new Extension({
        extnID: "2.5.29.37",
        critical: false,
        extnValue: extKeyUsage.toSchema().toBER(false),
        parsedValue: extKeyUsage
    }));

    const certType = new asn1js.Utf8String({value: "certType"});

    certificate.extensions.push(new Extension({
        extnID: "1.3.6.1.4.1.311.20.2",
        critical: false,
        extnValue: certType.toBER(false),
        parsedValue: certType
    }));

    const prevHash = new asn1js.OctetString({valueHex: (new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])).buffer});

    certificate.extensions.push(new Extension({
        extnID: "1.3.6.1.4.1.311.21.2", //szOID_CERTSRV_PREVIOUS_CERT_HASH
        critical: false,
        extnValue: prevHash.toBER(false),
        parsedValue: prevHash
    }));

    const certificateTemplate = new CertificateTemplate({
        templateID: "1.1.1.1.1.1",
        templateMajorVersion: 10,
        templateMinorVersion: 20
    });

    certificate.extensions.push(new Extension({
        extnID: "1.3.6.1.4.1.311.21.7", //szOID_CETIFICATE_TEMPLATE
        critical: false,
        extnValue: certificateTemplate.toSchema().toBER(false),
        parsedValue: certificateTemplate
    }));

    const caVersion = new CAVersion({
        certificateIndex: 10,
        keyIndex: 20
    });

    certificate.extensions.push(new Extension({
        extnID: "1.3.6.1.4.1.311.21.1",
        critical: false,
        extnValue: caVersion.toSchema().toBER(false),
        parsedValue: caVersion
    }));



    setup_promise = setup_promise
    .then(() => {
        const algorithm = getAlgorithmParameters(signAlg, "generatekey");
		if("hash" in algorithm.algorithm)
			algorithm.algorithm.hash.name = hashAlg;
		
		return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
    });

    setup_promise = setup_promise
    .then(keyPair => {
        publicKey = keyPair.publicKey;
        privateKey = keyPair.privateKey;
    }, error => Promise.reject(`Error during key generation: ${error}`));

    setup_promise = setup_promise
    .then(() => 
        certificate.subjectPublicKeyInfo.importKey(publicKey) //exporting public key into "subjectPublicKeyInfo" value of the certificate
    );

    setup_promise = setup_promise
    .then(() => 
        certificate.sign(privateKey, hashAlg)
    , error => Promise.reject(`Error during signing final certificate. Error info: ${error}`));

    setup_promise = setup_promise
    .then(() => {
        trustedCertificates.push(certificate);
        certificateBuffer = certificate.toSchema(true).toBER(false);
    }, error => Promise.reject(`Error during loading trusted certificates. Error info: ${error}`));

    setup_promise = setup_promise
    .then(() => 
        crypto.exportKey("pkcs8", privateKey)
    )

    setup_promise = setup_promise
    .then(privateKey => {
        privateKeyBuffer = privateKey;
    }, error => Promise.reject(`Error during exporting of private key: ${error}`));

    return setup_promise;
}

function GenerateCertificate() {
    return SetupNewCertificate().then(() => {
        return {certificateBuffer, privateKeyBuffer}
    }, error => {
        if (error instanceof Object) {
            alert(error.message);
        } else {
            alert(error);
        }
    });
}

export default GenerateCertificate;