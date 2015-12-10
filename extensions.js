
String.prototype.removeDiacritics = function() {
    var result = this.replace(/ı/g, 'i')
                .replace(/ç/, 'c');
    return result;
}

String.prototype.removeNonAlphabeticCharacters = function() {
    var result = this.replace(/[^a-zA-Z ]/g, '');
    return result;
}
