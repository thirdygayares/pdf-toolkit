import localFont from "next/font/local"

/**
 * Self-hosted handwriting fonts for typed signatures (OFL-licensed, fetched from
 * Google Fonts and committed under ./fonts so the tool works fully offline).
 *
 * Each loader exposes `.style.fontFamily` (the real, hashed family name) which we
 * use both for CSS previews and for rasterizing the signature onto a canvas.
 */

const dancingScript = localFont({ src: "./fonts/DancingScript.woff2", display: "swap" })
const greatVibes = localFont({ src: "./fonts/GreatVibes.woff2", display: "swap" })
const sacramento = localFont({ src: "./fonts/Sacramento.woff2", display: "swap" })
const caveat = localFont({ src: "./fonts/Caveat.woff2", display: "swap" })
const pacifico = localFont({ src: "./fonts/Pacifico.woff2", display: "swap" })

export interface SignatureFont {
    id: string
    fontFamily: string
    className: string
}

export const SIGNATURE_FONTS: SignatureFont[] = [
    { id: "dancing", fontFamily: dancingScript.style.fontFamily, className: dancingScript.className },
    { id: "great-vibes", fontFamily: greatVibes.style.fontFamily, className: greatVibes.className },
    { id: "caveat", fontFamily: caveat.style.fontFamily, className: caveat.className },
    { id: "sacramento", fontFamily: sacramento.style.fontFamily, className: sacramento.className },
    { id: "pacifico", fontFamily: pacifico.style.fontFamily, className: pacifico.className },
]

export const DEFAULT_FONT_ID = SIGNATURE_FONTS[0].id
