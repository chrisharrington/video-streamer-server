export class Id {
    _id: string;
}

export class File {
    path: string;

    constructor(path?: string) {
        this.path = path;
    }
}

export class Media extends Id {
    path: string;
}

export class Movie extends Media {
    name: string;
    poster: string;
    synopsis: string;
    year: number;

    constructor(path: string) {
        super();
        this.path = path;
        this.parse();
    }

    static fromFile(file: File) : Movie {
        let movie = new Movie(file.path);
        return movie;
    }

    private parse() {
        let split = this.path.split('\\'),
            last = split[split.length-1];

        split = last.split(' ');
        this.name = split.slice(0, split.length - 1).join(' '),
        this.year = parseInt(split[split.length - 1].replace('(', '').replace(')', ''))
    }
}