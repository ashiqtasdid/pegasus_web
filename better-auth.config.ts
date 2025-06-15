import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Use a dummy client for config generation
const client = new MongoClient("mongodb://localhost:27017");
const db = client.db("pegasus_auth");

export default betterAuth({
  database: mongodbAdapter(db),
  
  emailAndPassword: {
    enabled: true,
  },
  
  socialProviders: {
    github: {
      clientId: "dummy_client_id",
      clientSecret: "dummy_client_secret",
    },
  },
  
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string", 
        required: false,
      },
      avatar: {
        type: "string",
        required: false,
      },
    },
  },
});
