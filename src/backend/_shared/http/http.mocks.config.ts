import { HTTPStatusBase } from '../../index.d';

export const MOCK_HEADER: HTTPStatusBase = {
    protocol: 'http',
    protocolVersion: '1.1',
    status: '200',
    statusMessage: 'OK',
    date: 'Sat, 4 Okt 1986 15:00:00 GMT',
    server: '💻 MOCK-Apache',
    isMock: 'true', // custom field to identify mock headers
    // contentLocation: 'reverse.php',
    // vary: 'negotiate',
    // tcn: 'choice',
    // xFrameOptions: 'SAMEORIGIN',
    // xPoweredBy: 'PHP/7.1.33',
    // accessControlAllowOrigin: '*',
    // accessControlAllowMethods: 'OPTIONS,GET',
    // contentLength: '29',
    contentType: 'application/json; charset=UTF-8',
};
