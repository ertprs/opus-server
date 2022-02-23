const upperCase = (text) => {
    return text.toUpperCase();
}

const lowerCase = (text) => {
    return text.toLowerCase();
}

const trimSpaces = (text) => {
    return text.replace(/ /g, '');
}

const onlyNumbers = (text) => {
    let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let arrayText = text.split('');
    let value = [];
    let j = 0;
    let valueNumbers;
    for (let i = 0; i < arrayText.length; i++) {
        if (numbers.indexOf(arrayText[i]) >= 0) {
            value[j] = arrayText[i];
            j++;
        }
    }
    valueNumbers = value.join('');
    return valueNumbers;
}

const onlyChars = (text) => {
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's',
        't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];
    let arrayText = text.split('');
    let value = [];
    let j = 0;
    let valueCharacters;
    for (let i = 0; i < arrayText.length; i++) {
        if (letters.indexOf(arrayText[i]) >= 0) {
            value[j] = arrayText[i];
            j++;
        }
    }
    valueCharacters = value.join('');
    return valueCharacters;
}

const extremeTrim = (text) => {
    return text.trim();
}

const capitalize = (text) => {
    if (typeof text !== 'string') return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
}

module.exports = {
    upperCase,
    lowerCase,
    trimSpaces,
    onlyNumbers,
    onlyChars,
    extremeTrim,
    capitalize
}