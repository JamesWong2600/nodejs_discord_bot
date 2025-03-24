function detectLevel(point) {
    if (point <= 49) return 1;
    if (point >= 50) return 2;
    if (point >= 200) return 3;
    if (point >= 350) return 4;
    if (point >= 650) return 5;
    if (point >= 850) return 6;
    if (point >= 1200) return 7;
    if (point >= 1850) return 8;
    if (point >= 2480) return 9;
    if (point >= 3000) return 10;
    if (point >= 4500) return 11;
}

module.exports = { detectLevel };