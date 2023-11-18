File Upload System

I have used posgreSQL as my database alongwith Prisma as an ORM.

I have used a local database with a database name 'test'
Connection String example: postgres@localhost:5432/test
username= postgres
password= (no password in my case, can be added after the user like username:passsword)
server = localhost
port = default port for db (5432)
database name = test

Credentials can be managed in the schema.

To run the project, these are the steps:

In the CLI of the project root, run the following commands.
1.npm install
2.npm run generate
3.npm run migrate 4. npm run dev

generation and migration is needed only when there is a change in the schema of the db, as mentioned in the schema.prisma file.

The port at which this file upload system server runs is 3000.
