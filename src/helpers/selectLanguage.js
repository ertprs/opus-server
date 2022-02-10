const messageFile = require('../data/messages.json');

const selectLanguage = ( language ) => {
    let index = 0;
    for (let i=0; i < messageFile.length; i++){
        if (messageFile[i].language === language){
            index = i;
        }
    }
    return index;
} 

module.exports = {
    selectLanguage
}