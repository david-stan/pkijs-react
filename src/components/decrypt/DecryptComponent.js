import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import decrypt from '../../services/decrypt';
import { pkcs8ToArrayBuffer } from '../../utils/utils';

import './DecryptComponent.css';

const DecryptComponent = (props) => {
    const [privateKeyString, setPrivateKeyString] = useState("");
    const [fileInput, setFileInput] = useState({});
    const [decryptedContent, setDecryptedContent] = useState(new ArrayBuffer(0));
    const [certificateIndex, setCertificateIndex] = useState(0);

    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [decryptionSuccess, setDecryptionSuccess] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    const handleDecrypt = () => {
        if (decryptionSuccess) {
            toast.warning('File already decrypted!');
            return;
        }
        if (uploadSuccess) {
            decrypt(certificateIndex, pkcs8ToArrayBuffer(privateKeyString), fileInput)
                .then(decrypted => {
                    setDecryptedContent(decrypted);
                    setDecryptionSuccess(true);
                    toast.success('File decrypted!');
                })
                .catch(e => {
                    toast.error('Decryption failed!');
                })
        } else {
            toast.warning('Upload encrypted file first!');
        }

    }

    const handleUpload = () => {
        document.getElementById("upload").click();
    }

    const handleChangeTextarea = (e) => {
        const text = e.target.value;
        setPrivateKeyString(text);
    }

    const handleInput = (e) => {
        const file = e.target.files[0];
        let reader = new FileReader();

        reader.onload = function (e) {
            let arrayBuffer = reader.result
            setFileInput(arrayBuffer);
        }
        reader.readAsArrayBuffer(file);
        setUploadSuccess(true);
        toast.success('File uploaded!');
    }

    const handleDownloadDecrypted = () => {
        if (decryptionSuccess) {
            const blob = new Blob([decryptedContent], {type: props.mimeType});
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `decrypted-${+new Date()}`;
            link.click();
            setDownloadSuccess(true);
        } else {
            toast.warning('Decrypt file first!');
        }

    }

    const handleChangeSelect = (e) => {
        setCertificateIndex(Number(e.target.value));
    }

    return (
        <div className="container">
            <ToastContainer/>
            <div className="column-container">
                <p>Select certificate index: (default 0 - first recipient)</p>
                <div className="select-container">
                    <select onChange={handleChangeSelect}>
                        <option value="0">0</option>
                        <option value="1">1</option>
                    </select>
                </div>
            </div>
            <div className="column-container">
                <div className="private-key-container">
                    Insert PKCS#8 private key
                    <textarea onChange={handleChangeTextarea} value={privateKeyString}></textarea>
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
                            <button onClick={handleDecrypt}>Decrypt!</button>
                        </div>
                        <div className="info">
                            <p>Encrypt uploaded file.</p>
                        </div>
                        <div className="status">
                            Encryption success:
                        {decryptionSuccess
                                ? <span className="label success"></span>
                                : <span className="label warning"></span>}
                        </div>
                    </div>
                    <div className="inner-file-container">
                        <div className="button-container">
                            <button onClick={handleDownloadDecrypted}>Download!</button>
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


        </div>



    )
}

export default DecryptComponent;