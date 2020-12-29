import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import GenerateCertificate from './services/generate_certificate';

import {formatCertificateBuffer, formatPrivateKeyBuffer} from './utils';

const App = () => {

  const [firstCertBuffer, setFirstCertBuffer] = useState(new ArrayBuffer(0));
  const [secondCertBuffer, setSecondCertBuffer] = useState(new ArrayBuffer(0));

  const [firstPrivateKeyBuffer, setFirstPrivateKeyBuffer] = useState(new ArrayBuffer(0));
  const [secondPrivateKeyBuffer, setSecondPrivateKeyBuffer] = useState(new ArrayBuffer(0));

  const handleGenerateCertificates = () => {
    GenerateCertificate()
    .then(result => {
      setFirstCertBuffer(result.certificateBuffer);
      setFirstPrivateKeyBuffer(result.privateKeyBuffer);
      return GenerateCertificate();
    })
    .then(result => {
      setSecondCertBuffer(result.certificateBuffer);
      setSecondPrivateKeyBuffer(result.privateKeyBuffer);
    });
  }

  return (
    <>
      <div>
        <button onClick={handleGenerateCertificates}>Generate Certificates</button>
      </div>
      <div className="inline">
        <h3>First certificate</h3>
        <textarea value={formatCertificateBuffer(firstCertBuffer)}></textarea>
        <textarea value={formatPrivateKeyBuffer(firstPrivateKeyBuffer)}></textarea>
      </div>
      <div className="inline">
        <h3>Second Certificate</h3>
        <textarea value={formatCertificateBuffer(secondCertBuffer)}></textarea>
        <textarea value={formatPrivateKeyBuffer(secondPrivateKeyBuffer)}></textarea>
      </div>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root')) 