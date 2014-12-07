---
layout: post
title:  Weakening Your Maps - an experiment
date:   2014-02-10 12:37:34
image: weakmaps/feature.png
categories: javascript es6
---

So I was checking out the new data structures layed out in EcmaScript 6 today and found the WeakMap. My mind skipped to the limited coding I've done in Objective C and the whole non-atomic vs atomic properties thingy -- which was which again?

Where's the need for such a complex notion in JavaScript right? Oh -- memory leaks. That dreaded step ladder pattern in the the profiler we either decide to ignore for the time being, or spend a miserable few hours trying to debug. But, how can the WeakMap constructor help you?

I think the answer is that you generally won't use it, but here's one instance I can see it saving you from a complicated teardown procedure.

Say we're making an app where a user logs in, and we pull a list of their favorite movies. We could set the movies list as a property of our user object, but let's say we want to keep objects decoupled and make that "favorites" data somewhat private. Pay close attention to how our user object acts as the only reference to the list of their favorite movies:

{% highlight javascript %}
var favs = new WeakMap()
  , user
  , login
  , logout
  , getFavs;

login = function(id, pass) {
    $.get('/user', { data: { id: id, pass: pass } })
        .done(function(data) {
            // Create global reference to user
            user = data;
        })
        .done(function() {
            $.ajax('/favs/' + user.id)
                .done(function(data) {
                    // Use user object as key to retrieve favs.
                    favs.set(user, data);
                });
        });
};

logout = function() {
    // Allow user and user favs to be garbage collected.
    user = undefined;
}
    
getFavs = function() {
    // Use WeakMap getter to list users favorite movies.
    return 'Favs are: ' + favs.get(profile.user).split(', ');
};
{% endhighlight %}

So guess what happens when we set user to undefined? The favorites will magically be garbage collected because no reference to the favorites exist! Now consider the aformentioned alternative:

{% highlight javascript %}

var favs = {}
  , user
  , login
  , logout
  , getFavs;

login = function(id, pass) {
    $.get('/user', { data: { id: id, pass: pass } })
        .done(function(data) {
            // Set primary reference to user
            user = data;
        })
        .done(function() {
            $.ajax('/favs/' + user.id)
                .done(function(data) {
                    // Create normal reference to favorites
                    // This will stay a strong reference
                    // until it's manually unset.
                    favs[user.id] = data;
                });
        });   
};

logout = function(id, pass) {
    favs[user.id] = undefined; // Stupid extra step :(
    user          = undefined;
}
    
getFavs = function() {
    return 'Favs are: ' + favs[user.id].join(', ');
};
{% endhighlight %}

If we only undefined the 'user' variable here, we'd be left with the remaining user id reference to the favs. If we have a lot of these object relations, cleaning up would become a nightmare!

In short, you won't always use WeakMaps, but when you do, you'll save either memory or your sanity.

I set up a quick experiment to assure myself that the browser was indead garbage collecting the reference to the array in the WeakMap. To keep things simple, I removed the ajax calls and instead used a plain ol' object literal

{% highlight javascript %}
{
    "name": "EarthMan", 
    "id": 1
}
{% endhighlight %}

and associated it with a very large array:

{% highlight javascript %}
// This variable reference is lost when function returns.
var arr = [];
for(var i = 0; i < 99999; i++) {
    arr.push(i);
}
{% endhighlight %}

I inserted a snippet at the bottom of my two test scripts that immediately calls the login function followed by the logout function after 10 seconds. For the test that used the id reference (not the WeakMap), I didn't manually unset the reference to the array, only the reference to the user object. Here's the exciting result in Chrome Dev tools Version 34.0.1796.2 canary!

**The Test With WeakMap**
![Alt](/img/posts/weakmaps/with-weakmap.jpg "With weakmap")

**And Without WeakMap...**
![Alt](/img/posts/weakmaps/without-weakmap.jpg "With weakmap")

As predicted, the array is garbage collected quickly (the memory heap drops to 2.1MB around 27 seconds in) once the user object loses it's reference outside of the WeakMap. The user.id reference to the array prevents the array from being garbage collected as shown by the basically static 7.2MB line.

To try it out for yourself, check out [the demo](http://zigzackattack.github.io/WeakMap-Tests/).
