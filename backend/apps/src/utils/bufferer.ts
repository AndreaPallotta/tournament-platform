export const bufferToBase64 = (buffer: Buffer) => {
    return buffer.toString('base64');
}

export const base64ToBuffer = (content: string) => {
    const data = content.replace(/^data:image\/\w+;base64,/, '')
    return Buffer.from(data, 'base64');
}