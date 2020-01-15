export class StringExtensions {
    static toKebabCase(value: string) {
        return value.toLowerCase().split(' ').join('-');
    }
    
    static fromKebabCase(value: string) {
        return value.split('-').map(s => this.capitalize(s)).join(' ');
    }
    
    static capitalize(value: string) {
        value = value.toLowerCase();
        return value[0].toUpperCase() + value.substring(1);
    }
}