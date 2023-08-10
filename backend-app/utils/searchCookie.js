const searchCookies = (req, cookieName) => {
    const cookies =
        Object.keys(req.signedCookies).length > 0 ? req.signedCookies : false;
    if (!cookies) return false;
    const cookie = cookies[cookieName];
    if (!cookie) return false;
    return cookie;
};
module.exports = searchCookies;
