import {
    BrowserRouter as Router,
    Switch, Route, Redirect
} from 'react-router-dom';

import Header from './header/Header';
import EncryptComponent from './encrypt/EncyptComponent';
import DecryptComponent from './decrypt/DecryptComponent';

import '../App.css';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    return (
        <Router>
            <div className="body-container">
                <Header />
                <Switch>
                    <Route path="/encrypt">
                        <EncryptComponent />
                    </Route>
                    <Route path="/decrypt">
                        <DecryptComponent />
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