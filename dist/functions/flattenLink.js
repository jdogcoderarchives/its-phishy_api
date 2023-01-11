"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenLink = void 0;
/**
 *
 * @param link
 */
function flattenLink(link) {
    if (!link) {
        throw new Error("No link provided | L");
    }
    const rawlink = link;
    if (!rawlink) {
        throw new Error("No link provided | RW");
    }
    if (rawlink.startsWith("https://")) {
        const linky = rawlink.replace(/^https:\/\//i, "");
        const linky2 = linky.split(".").slice(-2).join(".");
        const linky3 = linky2.split("/")[0];
        return linky3;
    }
    else if (rawlink.startsWith("http://")) {
        const linky = rawlink.replace(/^http:\/\//i, "");
        const linky2 = linky.split(".").slice(-2).join(".");
        const linky3 = linky2.split("/")[0];
        return linky3;
    }
    else {
        const linky = rawlink.split(".").slice(-2).join(".");
        const linky2 = linky.split("/")[0];
        return linky2;
    }
}
exports.flattenLink = flattenLink;
//# sourceMappingURL=flattenLink.js.map