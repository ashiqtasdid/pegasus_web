import { MongoClient } from 'mongodb';

interface User {
  id?: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Session {
  id?: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Account {
  id?: string;
  providerId: string;
  accountId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VerificationToken {
  id?: string;
  identifier: string;
  value: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function createMongoClient(uri: string) {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export function mongoAdapter(client: MongoClient, databaseName = 'pegasus_auth') {
  const db = client.db(databaseName);
  
  return {
    id: 'mongodb',
      async createUser(user: Omit<User, 'id'>) {
      const collection = db.collection('users');
      const result = await collection.insertOne({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ...user, id: result.insertedId.toString() };
    },

    async getUser(id: string) {
      const collection = db.collection('users');
      const user = await collection.findOne({ id });
      return user ? { ...user, id: user.id || user._id.toString() } : null;
    },

    async getUserByEmail(email: string) {
      const collection = db.collection('users');
      const user = await collection.findOne({ email });
      return user ? { ...user, id: user.id || user._id.toString() } : null;
    },    async updateUser(id: string, updates: Partial<User>) {
      const collection = db.collection('users');
      await collection.updateOne(
        { id },
        { $set: { ...updates, updatedAt: new Date() } }
      );
      return this.getUser(id);
    },

    async deleteUser(id: string) {
      const collection = db.collection('users');
      await collection.deleteOne({ id });
    },    async createSession(session: Omit<Session, 'id'>) {
      const collection = db.collection('sessions');
      const result = await collection.insertOne({
        ...session,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ...session, id: result.insertedId.toString() };
    },

    async getSession(token: string) {
      const collection = db.collection('sessions');
      const session = await collection.findOne({ token });
      return session ? { ...session, id: session.id || session._id.toString() } : null;
    },    async updateSession(token: string, updates: Partial<Session>) {
      const collection = db.collection('sessions');
      const session = await collection.findOneAndUpdate(
        { token },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return session ? { ...session, id: session.id || session._id.toString() } : null;
    },

    async deleteSession(token: string) {
      const collection = db.collection('sessions');
      await collection.deleteOne({ token });
    },    async createAccount(account: Omit<Account, 'id'>) {
      const collection = db.collection('accounts');
      const result = await collection.insertOne({
        ...account,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ...account, id: result.insertedId.toString() };
    },

    async getAccount(providerId: string, accountId: string) {
      const collection = db.collection('accounts');
      const account = await collection.findOne({ providerId, accountId });
      return account ? { ...account, id: account.id || account._id.toString() } : null;
    },    async updateAccount(id: string, updates: Partial<Account>) {
      const collection = db.collection('accounts');
      await collection.updateOne(
        { id },
        { $set: { ...updates, updatedAt: new Date() } }
      );
      const account = await collection.findOne({ id });
      return account ? { ...account, id: account.id || account._id.toString() } : null;
    },

    async deleteAccount(id: string) {
      const collection = db.collection('accounts');
      await collection.deleteOne({ id });
    },    async createVerificationToken(verification: Omit<VerificationToken, 'id'>) {
      const collection = db.collection('verifications');
      const result = await collection.insertOne({
        ...verification,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ...verification, id: result.insertedId.toString() };
    },

    async getVerificationToken(identifier: string, token: string) {
      const collection = db.collection('verifications');
      const verification = await collection.findOne({ identifier, value: token });
      return verification ? { ...verification, id: verification.id || verification._id.toString() } : null;
    },

    async deleteVerificationToken(identifier: string, token: string) {
      const collection = db.collection('verifications');
      await collection.deleteOne({ identifier, value: token });
    },

    async getUserAccounts(userId: string) {
      const collection = db.collection('accounts');
      const accounts = await collection.find({ userId }).toArray();
      return accounts.map(account => ({ ...account, id: account.id || account._id.toString() }));
    },

    async getUserSessions(userId: string) {
      const collection = db.collection('sessions');
      const sessions = await collection.find({ userId }).toArray();
      return sessions.map(session => ({ ...session, id: session.id || session._id.toString() }));
    },
  };
}
