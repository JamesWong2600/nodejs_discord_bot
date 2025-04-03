function detectLevel(point) {
    if (point <= 49) return 1;
    if (point >= 50 && point <= 199) return 2;
    if (point >= 200 && point <= 349) return 3;
    if (point >= 350 && point <= 649) return 4;
    if (point >= 650 && point <= 849) return 5;
    if (point >= 850 && point <= 1199) return 6;
    if (point >= 1200 && point <= 1849) return 7;
    if (point >= 1850 && point <= 2479) return 8;
    if (point >= 2480 && point <= 2999) return 9;
    if (point >= 3000 && point <= 4499) return 10;
    if (point >= 4500) return 11;
}

module.exports = { detectLevel };