function parseClientList(envValue) {
    return envValue?.split(',').map(s => s.trim()).filter(Boolean) || [];
}

function getPdf3Client() {
    return (process.env.PDF3_CLIENT || 'Stop Auto Shop').trim();
}

function getSpecialClients() {
    return parseClientList(process.env.SPECIAL_CLIENTS);
}

function getPdfClientType(username) {
    if (username === getPdf3Client()) {
        return 'pdf3';
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
    getPdfClientType,
    getPdfDownloadPath,
    getPdfClientViewData,
    ensurePdfAccess,
};
