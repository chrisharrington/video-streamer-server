interface String {
    escapeForRegEx() : string;
}

String.prototype.escapeForRegEx = function() {
    return this.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}