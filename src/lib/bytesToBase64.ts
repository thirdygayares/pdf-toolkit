
export const bytesToBase64 = (bytes: Uint8Array) => {
    let binary = ""
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
}