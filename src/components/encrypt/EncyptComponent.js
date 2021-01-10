import { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { formatPrivateKeyBuffer } from '../../utils/utils';

import { mimeTypeService, firstKeyService, secondKeyService, firstCertService, secondCertService } from '../../services/store';

import GenerateCertificate from '../../services/generate_certificate';
import encrypt from '../../services/encrypt';

import './EncryptComponent.css';

const EncryptComponent = (props) => {

    const [encryptedBuffer, setEncryptedBuffer] = useState(new ArrayBuffer(0));

    const [fileInput, setFileInput] = useState({});

    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [encryptionSuccess, setEncryptionSuccess] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    const textAreaRefFirst = useRef(null);
    const textAreaRefSecond = useRef(null);

    const handleGenerateCertificates = () => {
        GenerateCertificate()
            .then(result => {
                firstCertService.sendCert(result.certificateBuffer);
                firstKeyService.sendKey(result.privateKeyBuffer);
                return GenerateCertificate();
            })
            .then(result => {
                secondCertService.sendCert(result.certificateBuffer);
                secondKeyService.sendKey(result.privateKeyBuffer);
                setEncryptionSuccess(false);
                setDownloadSuccess(false);
                toast.success('Certificates generated successfully!');
            })
            .catch((e) => {
                toast.error('Certificate generation failed.');
            });
    }

    const handleEncrypt = () => {
        if (encryptionSuccess) {
            toast.warning('File already encrypted!');
            return;
        }
        if (uploadSuccess) {
            encrypt(props.firstCert, props.secondCert, fileInput)
                .then(buffer => {
                    setEncryptedBuffer(buffer);
                    setEncryptionSuccess(true);
                    toast.success('File encrypted successfully!');
                })
                .catch((e) => {
                    toast.error('Encryption failed!');
                });
        } else {
            toast.warning('Upload a file first!');
        }
    }

    const handleUpload = () => {
        console.log(props);
        document.getElementById("upload").click();
    }


    const handleInput = (e) => {
        const file = e.target.files[0];
        let reader = new FileReader();

        reader.onload = function (e) {
            let arrayBuffer = reader.result
            setFileInput(arrayBuffer);
            mimeTypeService.sendType(file.type);
        }
        reader.readAsArrayBuffer(file);
        setUploadSuccess(true);
        toast.success('File uploaded.');
    }

    const handleDownloadEncrypted = () => {
        if (encryptionSuccess) {
            const blob = new Blob([encryptedBuffer], {type: 'application/octet-stream'});
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `encrypted-${+new Date()}`;
            link.click();
            setDownloadSuccess(true);
        } else {
            toast.warning('Encrypt file first!');
        }

    }

    const copyToClipboardFirst = (e) => {
        textAreaRefFirst.current.select();
        document.execCommand('copy');
        //e.target.focus();
    }

    const copyToClipboardSecond = (e) => {
        textAreaRefSecond.current.select();
        document.execCommand('copy');
        //e.target.focus();
    }

    return (
        <div className="container">
            <ToastContainer/>
            <div className="column-container">
                <div className="info">
                    <h3>Generate two X509 certificates and corresponding PKCS#8 private keys used later for decryption</h3>
                </div>
                <div className="button-container">
                    <button onClick={handleGenerateCertificates}>Generate!</button>
                </div>
            </div>
            <div className="column-container">
                <div className="private-key-container">
                    <div className="copy-container">
                        <p>Certificate Index 0 PKCS#8 Private Key</p>
                        <button className="copy-button" onClick={copyToClipboardFirst}>Copy key</button>
                    </div>
                    <textarea ref={textAreaRefFirst} readOnly value={formatPrivateKeyBuffer(props.firstKey)}></textarea>
                </div>
                <div className="private-key-container">
                    <div className="copy-container">
                        <p>Certificate Index 1 PKCS#8 Private Key</p>
                        <button className="copy-button" onClick={copyToClipboardSecond}>Copy key</button>
                    </div>
                    <textarea ref={textAreaRefSecond} readOnly value={formatPrivateKeyBuffer(props.secondKey)}></textarea>
                </div>
            </div>
            <div className="file-container">
                <div className="inner-file-container">
                    <div className="button-container">
                        <button onClick={handleUpload}>Upload</button>
                    </div>
                    <div className="info">
                        <p>Upload file for encryption.</p>
                    </div>
                    <div className="status">
                        File upload success:
                        {uploadSuccess
                            ? <span className="label success"></span>
                            : <span className="label warning"></span>}
                    </div>
                </div>
                <div className="inner-file-container">
                    <div className="button-container">
                        <button onClick={handleEncrypt}>Encrypt</button>
                    </div>
                    <div className="info">
                        <p>Encrypt uploaded file.</p>
                    </div>
                    <div className="status">
                        Encryption success:
                        {encryptionSuccess
                            ? <span className="label success"></span>
                            : <span className="label warning"></span>}
                    </div>
                </div>
                <div className="inner-file-container">
                    <div className="button-container">
                        <button onClick={handleDownloadEncrypted}>Download</button>
                    </div>
                    <div className="info">
                        <p>Download encrypted file.</p>
                    </div>
                    <div className="status">
                        Download success:
                        {downloadSuccess
                            ? <span className="label success"></span>
                            : <span className="label warning"></span>}
                    </div>
                </div>

                <div className="input-file">
                    <input id="upload" type="file" onChange={handleInput} />
                </div>

            </div>
        </div>
    )
}

export default EncryptComponent;