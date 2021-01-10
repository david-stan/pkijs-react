import {
    BrowserRouter as Router,
    Switch, Route, Redirect
} from 'react-router-dom';

import Header from './header/Header';
import EncryptComponent from './encrypt/EncyptComponent';
import DecryptComponent from './decrypt/DecryptComponent';

import { mimeTypeService, firstKeyService, secondKeyService, firstCertService, secondCertService } from '../services/store';

import '../App.css';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';

const App = () => {
    const [mimeType, setMimeType] = useState(null);
    const [firstKeyBuffer, setFirstKeyBuffer] = useState(new ArrayBuffer(0));
    const [secondKeyBuffer, setSecondKeyBuffer] = useState(new ArrayBuffer(0));

    const [firstCertBuffer, setFirstCertBuffer] = useState(new ArrayBuffer(0));
    const [secondCertBuffer, setSecondCertBuffer] = useState(new ArrayBuffer(0));

    useEffect(() => {
        const mimeSub = mimeTypeService.onNext().subscribe(type => {
            setMimeType(type);
        });
        const firstKeySub = firstKeyService.onNext().subscribe(key => {
            setFirstKeyBuffer(key);
        });
        const secondKeySub = secondKeyService.onNext().subscribe(key => {
            setSecondKeyBuffer(key);
        });
        const firstCertSub = firstCertService.onNext().subscribe(cert => {
            setFirstCertBuffer(cert);
        });
        const secondCertSub = secondCertService.onNext().subscribe(cert => {
            setSecondCertBuffer(cert);
        });
        return function () {
            mimeSub.unsubscribe();
            firstKeySub.unsubscribe();
            secondKeySub.unsubscribe();
            firstCertSub.unsubscribe();
            secondCertSub.unsubscribe();
        }
    }, []);
    return (
        <Router>
            <div className="body-container">
                <Header />
                <Switch>
                    <Route path="/encrypt">
                        <EncryptComponent firstKey={firstKeyBuffer} secondKey={secondKeyBuffer} firstCert={firstCertBuffer} secondCert={secondCertBuffer}/>
                    </Route>
                    <Route path="/decrypt">
                        <DecryptComponent mimeType={mimeType}/>
                    </Route>
                    <Route path="/">
                        <Redirect to="/encrypt" />
                    </Route>
                </Switch>
            </div>
        </Router>
    )
}

export default App;