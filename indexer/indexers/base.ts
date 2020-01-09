export default class Base {
    protected fileFilter(file: string) : boolean {
        return ['mkv', 'mp4', 'wmv', 'avi'].some((ext: string) => file.endsWith(ext)) &&
            file.indexOf('.done.mp4') > -1;
    }
}