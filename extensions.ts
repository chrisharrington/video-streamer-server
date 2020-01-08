interface String {
    escapeForRegEx() : string;
    escapeForUrl() : string;
}

String.prototype.escapeForRegEx = function() {
    return this.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

String.prototype.escapeForUrl = function () {
    return encodeURIComponent(this);
}