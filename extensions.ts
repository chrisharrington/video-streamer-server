export class StringExtensions {
    static escapeForRegEx(value: string) {
        return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    
    static escapeForUrl(value: string) {
        return encodeURIComponent(value);
    }

    static toKebabCase(value: string) {
        return value.toLowerCase().split(' ').join('-');
    }
    
    static fromKebabCase(value: string) {
        return value.split('-')
            .filter(v => v.length > 0)
            .map(s => this.capitalize(s)).join(' ');
    }

    static capitalize(value: string) {
        value = value.toLowerCase();
        return value.split(' ').map(v => v[0].toUpperCase() + v.substring(1)).join(' ');
    }
}