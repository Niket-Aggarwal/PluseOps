function validateAndCheckSSRF(urlStr) {
    try {
        if (!urlStr || typeof urlStr !== "string") {
            return { valid: false, reason: "URL string is required" };
        }

        const parsed = new URL(urlStr);

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return { valid: false, reason: "URL must use HTTP or HTTPS protocol" };
        }

        const hostname = parsed.hostname.toLowerCase();

        // Obvious local hostnames
        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "0.0.0.0" ||
            hostname === "::1" ||
            hostname === "[::1]" ||
            hostname.endsWith(".local") ||
            hostname.endsWith(".internal")
        ) {
            return { valid: false, reason: "Local and private hostnames are not allowed for monitoring" };
        }

        // Private IP regexes
        const privateIpRegexes = [
            /^127\./,
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[01])\./,
            /^192\.168\./,
            /^169\.254\./,
            /^0\./
        ];

        for (const regex of privateIpRegexes) {
            if (regex.test(hostname)) {
                return { valid: false, reason: "Private IP addresses are not allowed for monitoring" };
            }
        }

        return { valid: true };
    } catch (err) {
        return { valid: false, reason: "Invalid URL format" };
    }
}

module.exports = { validateAndCheckSSRF };
