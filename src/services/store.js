import {Subject} from 'rxjs';

const mimeTypeSubject = new Subject();
const firstKeySubject = new Subject();
const secondKeySubject = new Subject();
const firstCertSubject = new Subject();
const secondCertSubject = new Subject();

export const mimeTypeService = {
    sendType: type => mimeTypeSubject.next(type),
    onNext: () => mimeTypeSubject.asObservable()
}

export const firstKeyService = {
    sendKey: key => firstKeySubject.next(key),
    onNext: () => firstKeySubject.asObservable()
}

export const secondKeyService = {
    sendKey: key => secondKeySubject.next(key),
    onNext: () => secondKeySubject.asObservable()
}

export const firstCertService = {
    sendCert: cert => firstCertSubject.next(cert),
    onNext: () => firstCertSubject.asObservable()
}

export const secondCertService = {
    sendCert: cert => secondCertSubject.next(cert),
    onNext: () => secondCertSubject.asObservable()
}