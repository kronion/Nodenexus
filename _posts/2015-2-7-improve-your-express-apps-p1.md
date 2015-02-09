---
title:  "Improve Your Express Applications - Part 1"
---

Oh, Node.js. Love it or hate it, [the one true dev language of Hackathon Hackers][dev] has taken over. JavaScript, once generally reviled, is now being used to power asynchronous servers, websocket applications, asset pipelines, and [just about every programmable device under the sun][cyclon]. The LAMP stack (Linux, Apache, MySQL, PHP) has given way to the MEAN stack (MongoDB, Express, AngularJS, Node.js).

I personally enjoy writing JavaScript, and I use Express for most of my server needs. Even so, I think there is one regretable outcome of the rise of Node.js: **many developers are writing bad code**.

The Node.js platform is relatively new, but the number of frameworks in the ecosystem is already immense. There aren't yet good tutorials for all the tools you're likely to come across. Furthermore, because of the rapid churn in the ecosystem, some resources are already out of date. As a consequence, Node.js is probably harder to use *correctly* than more mature alternatives.

I began this post with the intention of outlining twelve common mistakes, antipatterns, and missed opportunities I find in Node and Express applications. However, as I began to write, I realized I had more to say than I could fit in a single post. Therefore, I have decided to write several shorter posts and publish in installations. These posts are targeted at developers with beginner to intermediate experience with Node. Some of the concepts are also transferable to other platforms, such as Rails or Django.

Please help me squash bugs and improve future posts by commenting below. If you have suggestions for errors to cover in future posts, I'd love to hear those as well!

## <span id="security"></span>1. Stop hard-coding your secret keys

Hard-coding keys is both extremely dangerous and relatively common; I've found hash keys, user passwords, and even PayPal credentials just by looking through repos on GitHub. Once your secrets are checked into version control, they're [nearly impossible to remove][sensitive]. Avoid calamity: put all private keys in a file that you include in your .gitignore from the very first commit (<a href="#gitignore">see #3</a>).

Often, people use the Node file system module to access key files, as in the following example:

{% highlight javascript linenos %}
// app.js
var fs = require('fs');
var keys = fs.readFileSync('secrets.txt', 'utf-8').split('\n');
var session_secret = keys[0],
    api_secret = keys[1],
    // etc...
var example = authenticate_with_API(api_secret);
{% endhighlight %}

secrets.txt looks something like this:

{% highlight text linenos %}
secret0
secret1
...
{% endhighlight %}

There's nothing wrong with this solution, but I prefer to import my keys as a module so that I get the semenatic benefits of objects.

{% highlight javascript linenos %}
// secrets.js
module.exports = {
  session_secret: 'secret0',
  API_secret: 'secret1' // etc.
};
{% endhighlight %}

{% highlight javascript linenos %}
// app.js
var keys = require('./secrets.js'); // Assuming secrets.js and app.js are in the same directory
var example = authenticate_with_API(keys.API_secret);
// etc...
{% endhighlight %}

I see two advantages to importing keys this way.

1. `require()` creates a "keychain" object which I find more elegant to deal with than the array in the first example. Sure, I could easily make my own keychain, but with `require()` I get it for free.
2. The purpose of a secret key is defined along with its value. In the second example, you immediately understand what each key is for by its name in secrets.js. You can even include comments if you want. In the first example, on the other hand, you know nothing just by looking at secrets.txt. In order to determine what a key is used for, you have to slog through the codebase looking for where it is ultimately used. You can't include comments in secrets.txt because `fs.readFileSync()` reads the entire file. Wait until you need to update a key (because a third-party API was compromised, for example), and you'll understand how annoying this is.

If you're committed to using `fs.readFileSync()`, you could put each key in its own file and reflect its purpose in the filename. However, this solution clutters both your directory and your server code as the number of keys increases. You also have to remember to update .gitignore each time you make a new file, or else you risk accidentally uploading that file to your remote repository. And then you may as well have just hard-coded the key :)

## 2. Configure sessions properly

Sessions are a critical part of web applications that need to save user data. Look at Facebook, GitHub, or just about any other service which requires a login, and you'll find that it relies on sessions. Without sessions, the web would be a static and impersonal experience.

At the simplest level, sessions are a mechanism whereby an application saves and retrieves data for a particular user across requests or site visits. There are two kinds of sessions, and they differ in the way that they utilize cookies and store user data. To understand the difference, you should be comfortable with the way cookies work in the context of HTTP. [This guide][cookies] is a great refresher.

1. In a typical session, each user logs in and receives a cookie containing a key. Personal data is stored in a database and retrieved using the key. When people use the word 'session,' they are usually referring to this kind of session.
2. In a cookie session, all personal data is stored directly in the user's cookie.

Both kinds of sessions allow for similar dynamic applications, and I often see developers implement one form or the other without considering the trade-offs. Sessions and cookie sessions are not interchaneable. Failure to use the correct option may completely undermine the functionality and integrity of your application.

That sounds awfully dire, so let me back up my claim with an example. Suppose you are building a payment service like Venmo that needs to keep track of the balance in user accounts. Traditional sessions would work just fine here, but cookie sessions would be inappropriate. Why, you ask? A cookie session works by having the user provide all personal data herself for each request. If the user can modify the values stored in the cookie, however, she may fool the application into believing anything she wants. In the Venmo example where cookie sessions are used, users could attempt to modify their cookies to change their account balances or other sensitive data. Encrypting cookies helps prevent this sort of attack, but even then cookies may still be "replayed," or reverted to a former valid value.

Normal sessions solve this problem by restricting the ways in which records in the backend database can be updated. The user can only interact with those records through the endpoints exposed by the appliction. Therefore, the developer is responsible for the integrity and validity of all user data. Suppose the Venmo application uses normal sessions and therefore stores account balance data in its own backend database. Protecting the balances from tampering is as simple as controlling the ways in which user requests affect database entries. There are still some important details to iron out, such as preventing the forgery of valid requests, but the point is that the application can handle the problem of ensuring data validity by limiting access.

Cookie sessions still have their uses. Normal sessions make data storage the application's job, whereas cookie sessions save data on the browsers of users. As long as your application does not make use of sensitive personal data, you might be able to divest yourself of the cost of backend storage by using cookie sessions. Be aware, however, that users might delete their cookies, change browsers, or use new computers. In all of these cases, user data is left behind or lost along with your cookie.

Hopefully you now understand when to use each type of session implementation. Many other guides provide example code for setting up sessions, so I won't reinvent the wheel here. I recommend [these][sessions1] [two][sessions2] guides for implementing sessions with Express 3.x. As of Express 4.x, session and cookie session middleware is no longer included by default; you must `npm install express-session cookie-session` and include the modules explicitly. As a final note, always make sure to use a third-party session store like [connect-mongo][connect-mongo] or [connect-redis][connect-redis] when using sessions in production. The Express session middleware defaults to using a store called MemoryStore if you don't specify your own. MemoryStore is fine for local use, but it is not safe in production because it saves all sessions directly in memory! MemoryStore-backed sessions will consume RAM until your machine grinds to a halt, and they will not be saved in the event of a shutdown or system crash.

## <span id="gitignore"></span>3. Always add node_modules to your .gitignore file

Repository management is an important (and often overlooked) part of any project. As more and more people contribute to a repository, the potential for it to get cluttered increases. The .gitignore file gives you a mechanism to prevent the clutter before it happens. Each line of the file is a [glob][glob] telling git to exclude any matching file. Now there's no excuse for pesky .DS_Store and \*.swp files getting checked into the codebase.

The one limitation of .gitignore is that it does not apply to any file which has already been checked into version control. If a collaborator pushes unwanted files to your repository before you upload a .gitignore, you will have to remove these files yourself. Even then the removed files may still be found by viewing the previous commits, so you could have a security problem on your hands (<a href="#security">see #1</a>).

So what is node_modules, then? Whenever you install a dependency with npm (Node Package Manager), it is placed in a directory called node_modules in your current working directory. The expected pattern is to install all dependencies from your project's root directory, so that's where your node_modules directory should be located. If you've ever experienced global-dependency-conflict hell in a language like Python or Ruby, you are familiar the headache npm saves you by making all dependencies local. 

You might be thinking that it makes sense to push node_modules to your repository so that anybody who clones it gets the dependencies bundled with the rest of the application. However, it is easy for the user to install the dependencies herself with a single additional command. It is standard practice for Node developers to list all dependencies in a file called package.json in the root directory. If somebody clones your repository and runs the command `npm install`, npm will read the dependencies listed in package.json and install them automatically. Given this ease of installation, there really is no need to include node_modules in the repository; in fact, they just create clutter. Imagine reviewing a diff between commits where one of your collaborators has added a dependency. Dependencies like Express can add many kilobytes, even megabytes of code to your repository. You want to see how and why the collaborator is using the new dependency, not line after line of code which your team isn't responsible for.

npm will install the latest version of a dependency by default. In the event that a project requires a specific version of a dependency, one can specify that exact version in package.json. However, most dependencies have their own sub-dependencies, and it may not be safe to assume that the maintainer of each dependency has specified exact versions for all of those modules.  What happens if a submodule changes versions and breaks the main dependency? How can the repository owner ensure that clients are always able to download a working set of dependencies without including that bloatware in the repository? npm has a solution to this problem called [shrinkwrap][shrinkwrap], which I'll write about in a future post.

<hr>

If you're a newcomer to the Node community, I hope that these lessons help you to write better code. Again, I welcome bug fixes and suggestions for future topics in writing elegant, correct applications with Node and Express. Let me know what you think in the comments below!

[dev]: https://www.facebook.com/groups/hhcirclejerk/permalink/1674705349423705/
[cyclon]: http://cylonjs.com/
[sensitive]: https://help.github.com/articles/remove-sensitive-data/
[cookies]: http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
[sessions1]: http://expressjs-book.com/forums/topic/express-js-sessions-a-detailed-tutorial/
[sessions2]: http://blog.modulus.io/nodejs-and-express-sessions
[connect-mongo]: https://github.com/kcbanner/connect-mongo
[connect-redis]: https://github.com/tj/connect-redis
[glob]: http://tldp.org/LDP/abs/html/globbingref.html/
[shrinkwrap]: https://docs.npmjs.com/cli/shrinkwrap
