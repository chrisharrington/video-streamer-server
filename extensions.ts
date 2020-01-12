export class StringExtensions {
    static escapeForRegEx(value: string) {
        return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    
    static escapeForUrl(value: string) {
        return encodeURIComponent(value);
    }
}