import { User } from '@root/models';

import { Base } from './base';

import Secret from '@root/secret';

class AuthService extends Base<User> {
    constructor() {
        super('users');
    }

    async signIn(email: string, password: string) : Promise<User | null> {
        if (email !== Secret.email || password !== Secret.password)
            return null;

        let user = await this.findOne({ email }),
            token = this.token(32);

        if (!user) {
            let user = { email, token } as User;
            await this.insertOne(user)
        } else {
            user.token = token;
            await this.updateOne(user);
        }

        return user;
    }

    private token(length: number) : string {
        let result = '',
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++)
           result += characters.charAt(Math.floor(Math.random() * characters.length));
        return result;
     }
}

export default new AuthService();