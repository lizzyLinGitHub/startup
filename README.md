# startup
CS 260 - Web Programming Startup

What I learned from SIMON Login:



Endpoint design


Using HTTP we can map out the design of each of our endpoints.

Create authentication endpoint
This takes an email and password and returns a cookie containing the authentication token and user ID. If the email already exists it returns a 409 (conflict) status code.

POST /auth/create HTTP/2
Content-Type: application/json

{
  "email":"marta@id.com",
  "password":"toomanysecrets"
}
HTTP/2 200 OK
Content-Type: application/json
Set-Cookie: auth=tokenHere

{
  "id":"337"
}
Login authentication endpoint
This takes an email and password and returns a cookie containing the authentication token and user ID. If the email does not exist or the password is bad it returns a 401 (unauthorized) status code.

POST /auth/login HTTP/2
Content-Type: application/json

{
  "email":"marta@id.com",
  "password":"toomanysecrets"
}
HTTP/2 200 OK
Content-Type: application/json
Set-Cookie: auth=tokenHere

{
  "id":"337"
}
GetMe endpoint
This uses the authentication token stored in the cookie to look up and return information about the authenticated user. If the token or user do not exist it returns a 401 (unauthorized) status code.

GET /user/me HTTP/2
Cookie: auth=tokenHere
HTTP/2 200 OK
Content-Type: application/json

{
  "email":"marta@id.com"
}
Web service
With our service endpoints designed, we can now build our web service using Express.

const express = require('express');
const app = express();

app.post('/auth/create', async (req, res) => {
  res.send({ id: 'user@id.com' });
});

app.post('/auth/login', async (req, res) => {
  res.send({ id: 'user@id.com' });
});

const port = 8080;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
Follow these steps, and then add in the code from the sections that follow. There is a copy of the final version of the example at the end of this instruction. If you get lost, or things are not working as expected, refer to the final version.

Create a directory called authTest that we will work in.

Save the above content to a file named main.js. This is our starting web service.

Run npm init -y to initial the project to work with node.js.

Run npm install express cookie-parser mongodb uuid bcrypt to install all of the packages we are going to use.

Run node main.js or press F5 in VS Code to start up the web service.

You can now open a console window and use curl to try out one of the endpoints.

➜  curl -X POST localhost:8080/auth/create

{"id":"user@id.com"}
Handling requests
With our basic service created, we can now implement the create authentication endpoint. The first step is to read the credentials from the body of the HTTP request. Since the body is designed to contain JSON we need to tell Express that it should parse HTTP requests, with a content type of application/json, automatically into a JavaScript object. We do this by using the express.json middleware. We can then read the email and password directly out of the req.body object. We can test that this is working by temporarily including them in the response.

app.use(express.json());

app.post('/auth/create', (req, res) => {
  res.send({
    id: 'user@id.com',
    email: req.body.email,
    password: req.body.password,
  });
});
➜  curl -X POST localhost:8080/auth/create -H 'Content-Type:application/json' -d '{"email":"marta@id.com", "password":"toomanysecrets"}'

{"id":"user@id.com","email":"marta@id.com","password":"toomanysecrets"}
Now that we have proven that we can parse the request bodies correctly, we can change the code to add a check to see if we already have a user with that email address. If we do, then we immediately return a 409 (conflict) status code. Otherwise we create a new user and return the user ID.

app.post('/auth/create', async (req, res) => {
  if (await getUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    res.send({
      id: user._id,
    });
  }
});
Using the database
We want to persistently store our users in Mongo and so we need to set up our code to connect to and use the database. This code is explained in the instruction on data services if you want to review what it is doing.

const { MongoClient } = require('mongodb');

const userName = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

const url = `mongodb+srv://${userName}:${password}@${hostname}`;
const client = new MongoClient(url);
const collection = client.db('authTest').collection('user');
With a Mongo collection object we can implement the getUser and createUser functions.

function getUser(email) {
  return collection.findOne({ email: email });
}

async function createUser(email, password) {
  const user = {
    email: email,
    password: password,
    token: 'xxx',
  };
  return collection.insertOne(user);
}
But, we are missing a couple of things. We need to a real authentication token, and we cannot simply store a clear text password in our database.

Generating authentication tokens
To generate a reasonable authentication token we use the uuid package. UUID stands for Universally Unique Identifier, and it does a really good job creating a hard to guess, random, unique ID.

const uuid = require('uuid');

token: uuid.v4();
Securing passwords
Next we need to securely store our passwords. Failing to do so is a major security concern. If, and it has happened to many major companies, a hacker is able to access the database, they will have the passwords for all of your users. This may not seem like a big deal if your application is not very valuable, but users often reuse passwords. That means you will also provide the hacker with the means to attack the user on many other websites.

So instead of storing the password directly, we want to cryptographically hash the password so that we never store the actual password. When we want to validate a password during login, we can hash the login password and compare it to our stored hash of the password.

To hash our passwords we will use the bcrypt package. This creates a very secure one way hash of the password. If you are interested in understanding how bcrypt works, it is definitely worth the time.

const bcrypt = require('bcrypt');

async function createUser(email, password) {
  // Hash the password before we insert it into the database
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  await collection.insertOne(user);

  return user;
}
Passing authentication tokens
We now need to pass our generated authentication token to the browser when the login endpoint is called, and get it back on subsequent requests. To do this we use HTTP cookies. The cookie-parser package provides middleware for cookies and so we will leverage that.

We import the cookieParser object and then tell our app to use it. When a user is successfully created, or logs in, we set the cookie header. Since we are storing an authentication token in the cookie we want to make it as secure as possible, and so we use the httpOnly, secure, and sameSite options.

httpOnly tells the browser to not allow JavaScript running on the browser to read the cookie.
secure requires HTTPS to be used when sending the cookie back to the server.
sameSite will only return the cookie to the domain that generated it.
const cookieParser = require('cookie-parser');

// Use the cookie parser middleware
app.use(cookieParser());

apiRouter.post('/auth/create', async (req, res) => {
  if (await DB.getUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await DB.createUser(req.body.email, req.body.password);

    // Set the cookie
    setAuthCookie(res, user.token);

    res.send({
      id: user._id,
    });
  }
});

function setAuthCookie(res, authToken) {
  res.cookie('token', authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}
Login endpoint
The login authorization endpoint needs to get the hashed password from the database, compare it to the provided password using bcrypt.compare, and if successful set the authentication token in the cookie. If the password does not match, or there is no user with the given email, the endpoint returns status 401 (unauthorized).

app.post('/auth/login', async (req, res) => {
  const user = await getUser(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});
GetMe endpoint
With everything in place to create credentials and login using the credentials, we can now implement the getMe endpoint to demonstrate that it all actually works. To implement this we get the user object from the database by querying on the authentication token. If there is not an authentication token, or there is no user with that token, we return status 401 (unauthorized).

app.get('/user/me', async (req, res) => {
  authToken = req.cookies['token'];
  const user = await collection.findOne({ token: authToken });
  if (user) {
    res.send({ email: user.email });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});
Final code
Here is the full example code.

const { MongoClient } = require('mongodb');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

const userName = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

const url = `mongodb+srv://${userName}:${password}@${hostname}`;
const client = new MongoClient(url);
const collection = client.db('authTest').collection('user');

app.use(cookieParser());
app.use(express.json());

// createAuthorization from the given credentials
app.post('/auth/create', async (req, res) => {
  if (await getUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({
      id: user._id,
    });
  }
});

// loginAuthorization from the given credentials
app.post('/auth/login', async (req, res) => {
  const user = await getUser(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// getMe for the currently authenticated user
app.get('/user/me', async (req, res) => {
  authToken = req.cookies['token'];
  const user = await collection.findOne({ token: authToken });
  if (user) {
    res.send({ email: user.email });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

function getUser(email) {
  return collection.findOne({ email: email });
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  await collection.insertOne(user);

  return user;
}

function setAuthCookie(res, authToken) {
  res.cookie('token', authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

const port = 8080;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
Testing it out
With everything implemented we can use curl to try it out. First start up the web service from VS Code by pressing F5 and selecting node.js as the debugger if you have not already done that. You can set breakpoints on all of the different endpoints to see what they do and inspect the different variables. Then open a console window and run the following curl commands. You should see similar results as what is shown below. Note that the -c and -b parameters tell curl to store and use cookies with the given file.

➜  curl -X POST localhost:8080/auth/create -H 'Content-Type:application/json' -d '{"email":"지안@id.com", "password":"toomanysecrets"}'

{"id":"639bb9d644416bf7278dde44"}


➜  curl -c cookie.txt -X POST localhost:8080/auth/login -H 'Content-Type:application/json' -d '{"email":"지안@id.com", "password":"toomanysecrets"}'

{"id":"639bb9d644416bf7278dde44"}


➜  curl -b cookie.txt localhost:8080/user/me

{"email":"지안@id.com"}




What I learned from SIMON DB:

I got much more profficient in command line editing during this whole exercise. 

Keeping your db login credentials is important to avoid hackers getting into your database. 






Setting a goal is a step on the road to progression, but it is just a start! In order to actually become better in all areas of life, we need to keep track of our goals and act to make it happen. This application is a central location to track your goals. You put in your goal, and the aplication walks you through the process to make it a SMART goal (SMART stands for specific, measurable, achievable, relevant, and time-bound).You will create a plan to accomplish it, and the application includes options for reminders, monthly and weekly breakdowns for accomplishing your goal, and a timer countdown to show how much longer you have left to achieve your goal. 

KEY FEATURES:

-Dock to see at once all of the goals you are working on.

-Ability to click into the dock to see the SMART plan you made for your goal

-Reminders to help you keep on pace to achieve the goal

-Connecting with friends to help keep you accountable


<img width="877" alt="Screenshot 2023-01-27 at 1 15 11 PM" src="https://user-images.githubusercontent.com/122473979/215188532-c4731fb6-d453-4ec3-9294-dea2759e332a.png">


What I learned from Simon HTML:
html is pretty straight forward. Using the Simon as an example, it will be pretty easy to add into my website different actions and functions. VSCode also has several helps to make writing in html quicker and more intuitive.

The deployFiles.sh took me awhile to understand and get through. I understand each element of it now, and I uploaded it to my startup because it will be usefull when deploying my startup. I know I have deployed before, but I want to keep it at easy access.


What I learned from Simon Service:
<img width="1031" alt="Screenshot 2023-03-21 at 7 40 12 PM" src="https://user-images.githubusercontent.com/122473979/226779731-db306ebb-f5b1-41ed-ad96-41e85afb8c33.png">

UI Testing is super important/difficult because there are so many things to test. But there is software we can do to help us!







What I learned from Simon CSS:

Here are all the resources I will be coming back to as I do my own CSS:
<img width="818" alt="Screenshot 2023-02-21 at 6 22 54 AM" src="https://user-images.githubusercontent.com/122473979/220356366-b78c04aa-e393-437c-b3ed-f83d5a37ae3d.png">
<img width="872" alt="Screenshot 2023-02-21 at 6 23 32 AM" src="https://user-images.githubusercontent.com/122473979/220356504-61a7760b-1b34-4f84-924f-d4e35701ac0e.png">
<img width="522" alt="Screenshot 2023-02-21 at 6 23 46 AM" src="https://user-images.githubusercontent.com/122473979/220356540-8560f864-a203-4f81-b20b-66b9732ebbbe.png">
<img width="869" alt="Screenshot 2023-02-21 at 6 23 56 AM" src="https://user-images.githubusercontent.com/122473979/220356579-d9cf2e93-a10f-4a51-ad8a-475465cf9ec3.png">



JavaScript Notes:
Arrow functions help with syntax, including a function as a parameter of a function.

Regular Expressions Example:
<img width="794" alt="Screenshot 2023-03-06 at 7 35 15 PM" src="https://user-images.githubusercontent.com/122473979/223305172-83da7c6c-0bb0-4798-bc06-c9bb57f347a6.png">

Promise Example:
<img width="433" alt="Screenshot 2023-03-06 at 10 12 38 PM" src="https://user-images.githubusercontent.com/122473979/223326507-f5f85cc4-cf6a-477c-8666-323755a94759.png">

Async/Await example:
<img width="859" alt="Screenshot 2023-03-06 at 10 13 29 PM" src="https://user-images.githubusercontent.com/122473979/223326633-c9e7fcc3-4d10-4b44-b8de-3a2b371805a1.png">


Notes from the Midterm Review:

In HTML, what does <div> do? Creates a division element

To point to another DNS record, you should use the following DNS record type: CNAME is an alias to another A record. A records point to literal IP Address. CNAME lets you change the IP address later without having to redirect everything. 

You can use this CSS to load fonts from Google: TRUE

What will the following output?<img width="427" alt="Screenshot 2023-03-09 at 12 44 48 PM" src="https://user-images.githubusercontent.com/122473979/224136943-ed07fe94-6cd9-4afa-93ef-d59247be79b2.png">

burger fries taco shake noodles

Which of the following is valid JSON? {"x":3}. JSON always uses double quotes, JSON does not use undefined


Using CSS, how would you turn only the BYU text blue? div.header <color:blue;}

Which of the following is not a valid way to include JS in HTML? <javascript>1+1</javascript>

What does the following code output?
<img width="410" alt="Screenshot 2023-03-09 at 12 55 46 PM" src="https://user-images.githubusercontent.com/122473979/224139363-836e4e14-ad40-45b9-a3b3-262c9f711942.png">
['rat','fish']
/ is a case insensitive indicator.

Which of the following is not a valid JS function? function f(x) = {}.
const f = function(x) {} works because you are creating an anonymous function and assigning it the variable name f.

The CSS property padding: puts space around the content of selected elements.
Pals Before Marriage. Contents in the middle, then Padding Border Margin is priority listing for padding.

What is the order of the CSS box model, starting from outside going in? Margin, border, padding, content.

What does the following code output?
<img width="414" alt="Screenshot 2023-03-09 at 1 05 50 PM" src="https://user-images.githubusercontent.com/122473979/224142150-444861dc-8ede-42fd-911d-ab8290660c9b.png">
cow:rat:fish
Reduce takes an array and reduced it down to one value.

What is the HTML tag for an unordered list? <ul>. <ol> is an ordered list. <li> are the items that go in the list. 

What does the following code do?
<img width="411" alt="Screenshot 2023-03-09 at 1 10 23 PM" src="https://user-images.githubusercontent.com/122473979/224143394-9557d1eb-faad-41ad-9dae-6f42d4d7b72d.png">
Adds a mouseover listening event to a p elements. queryselector gives you the first element named p, queryselectorall give you an iterator to get all p elements.

Which HTML will create a valid hyperlink? 
<a href='https://c.com'>x</a>

What does the following code output?<img width="336" alt="Screenshot 2023-03-09 at 1 14 38 PM" src="https://user-images.githubusercontent.com/122473979/224144545-121913dd-f53f-4e5f-9418-58ede44dcb47.png">
['a1', 'a2', 'a3']. Map takes array and maps it to something of equal size slightly changed.

What will the following output?<img width="411" alt="Screenshot 2023-03-09 at 1 17 30 PM" src="https://user-images.githubusercontent.com/122473979/224145334-2fe2d380-67dd-4d03-9dc9-4ee6e34c6ee2.png">
ADB. Await makes you wait until the promise executes to continue. Async will always return a promise.

What does the DOM textContent property do? Sets the child text for the an element.

Which of the following is a DNS subdomain? 260.cs.byu.edu. Whole thing is the subdomain, not just the 260.cs

How will the "hello world" text be oriented?<img width="259" alt="Screenshot 2023-03-09 at 1 23 39 PM" src="https://user-images.githubusercontent.com/122473979/224146951-c6a28409-2f7b-403d-88fd-953352945302.png">
Two lines, with the first line saying World and the second saying Hello. flex-direction: column-reverse; takes all the column elements and flips it upside down.


Executing the following will output: <img width="268" alt="Screenshot 2023-03-09 at 1 26 26 PM" src="https://user-images.githubusercontent.com/122473979/224147665-2172b439-6ce6-4891-b2d7-143c8bb41a00.png">
4

Which of the following is a valid JS object? {n:1}
Need the colon!!<img width="1012" alt="Screenshot 2023-03-09 at 1 28 45 PM" src="https://user-images.githubusercontent.com/122473979/224148222-a071bd13-ed15-4aed-af06-5adb293fd5e2.png">


The following command makes a script executable:
chmod +x deploy.sh<img width="1009" alt="Screenshot 2023-03-09 at 1 29 43 PM" src="https://user-images.githubusercontent.com/122473979/224148543-7ef4d0e2-529c-4688-98ba-bed23925439e.png">
Know what these four commands do.

WEB SERVERS:
