function parseClientList(envValue) {
    return envValue?.split(',').map(s => s.trim()).filter(Boolean) || [];
}

function getPdf3Client() {
    return (process.env.PDF3_CLIENT || 'Stop Auto Shop').trim();
}

function getSpecialClients() {
    return parseClientList(process.env.SPECIAL_CLIENTS);
}

function getPdf4Clients() {
    return parseClientList(process.env.PDF4_CLIENTS);
}

function getPdf5Clients() {
    return parseClientList(process.env.PDF5_CLIENTS);
}

function getPdfClientType(username) {
    if (username === getPdf3Client()) {
        return 'pdf3';
    }
    if (getPdf4Clients().includes(username)) {
        return 'pdf4';
    }
    if (getPdf5Clients().includes(username)) {
        return 'pdf5';
    }
    if (getSpecialClients().includes(username)) {
        return 'pdf2';
    }
    return 'pdf1';
}

function getPdfDownloadPath(username) {
    const type = getPdfClientType(username);
    if (type === 'pdf3') {
        return '/paket/downloadpdf3';
    }
    if (type === 'pdf4') {
        return '/paket/downloadpdf4';
    }
    if (type === 'pdf5') {
        return '/paket/downloadpdf5';
    }
    if (type === 'pdf2') {
        return '/paket/downloadpdf2';
    }
    return '/paket/downloadpdf';
}

function getPdfClientViewData(username) {
    const pdfClientType = getPdfClientType(username);
    return {
        pdfClientType,
        pdfDownloadPath: getPdfDownloadPath(username),
        isPdf3Client: pdfClientType === 'pdf3',
        isSpecialClient: pdfClientType === 'pdf2',
    };
}

function ensurePdfAccess(req, res, requiredType) {
    const userRole = req.user.role;

    if (userRole === 'admin') {
        if (requiredType !== 'pdf1') {
            res.status(403).send('Unauthorized');
            return false;
        }
        return true;
    }

    if (userRole !== 'klijent') {
        res.status(403).send('Unauthorized');
        return false;
    }

    const type = getPdfClientType(req.user.username);
    if (type !== requiredType) {
        res.redirect(getPdfDownloadPath(req.user.username));
        return false;
    }

    return true;
}

module.exports = {
    getPdf3Client,
    getSpecialClients,
    getPdf4Clients,
    getPdf5Clients,
    getPdfClientType,
    getPdfDownloadPath,
    getPdfClientViewData,
    ensurePdfAccess,
};
