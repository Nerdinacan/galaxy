// Utilities that should be built into javascript

const toSolidBytes = (match, p1) => {
    return String.fromCharCode("0x" + p1);
};

export function b64EncodeUnicode(str) {
    let utf8ish = encodeURIComponent(str);
    let fixpercent = utf8ish.replace(/%([0-9A-F]{2})/g, toSolidBytes);
    return btoa(fixpercent);
}

export function b64DecodeUnicode(str) {
    let fixPercent = c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    return decodeURIComponent(
        atob(str)
            .split("")
            .map(fixPercent)
            .join("")
    );
}
