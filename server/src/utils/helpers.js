function generateGameCode(length = 6) {
    const randomString = Math.random().toString(36).substring(2, 2 + length);
    return randomString.split('')
        .map((char, index) => Math.random() > 0.5 ? char.toUpperCase() : char)
        .join('');
}
module.exports = {generateGameCode};