---
layout: post
title: Sneaking a JavaScript App into Drupal
image: js-app-in-drupal/featured.jpg
categories: cms drupal javascript
---

When you think of Drupal modules, you probably think of 'hooks', 'form API', etc. But what if you want to build a front end Drupal plugin or app? Drupal's at least four steps ahead of you!

## Drupal.behaviors

An excellent way to attach your javascript code to a Drupal module is to use Drupal.behaviors for two reasons. First, using the classic jQuery $(function (){}) trick to get your app to load is a very detached way of linking your code in. You have no way to control how your application interacts with Drupal events. That bring's me to reason #2 -- attaching your app to Drupal.behaviors will allow Drupal to trigger a refresh of your app when Drupal core loads additional information using Ajax. This is incredibly useful for dealing with modules like Views that use Ajax pagers, or quick tabs. Here's a code snipped to get you started!

{% highlight javascript %}
var App = function() { 
    alert('I am your new javascript web app. Nice to meet you :)'); 
} 

Drupal.behaviors.myModule = { 
 attach: App
};
{% endhighlight %}

And there you go! You may be wondering at this point how to connect this code to your module... Of course, Drupal can't automatically detect new code files in your modules folder, and you need to set up your module in the first place. A guide on setting up a module is out of the scope of this tutorial, but I'll give you the basic structure. You need to create a new folder with the module name in the sites/all/modules folder of your drupal installation. Once you have that folder make two files there -- [module-name].info and [module-name].module. We're mostly concerned with the .info file for now. There you need to define the module name, its description, Drupal core and version. Here's an example for you.

{% highlight ini %}
; Info file for myModule 

name = myModule 
description = A very basic module
core = 7.x        ; Module will only run in 7.x 
version = 7.x-1.0 ; Unrealistic, but lets say it's perfect from the get-go!
{% endhighlight %}

Oaky... but there's still no reference to our awesome javascript file yet! Yeah, good point. Just add the following below the version number

{% highlight ini %}
scripts[] = path/to/script.js
{% endhighlight %}

You can add as many scripts here as you like. Sadly, as you might have noticed at this point, adding scripts this way will weigh down our site immensely with HTTP requests and loading all the code on pages that don't use it would not be a good idea. That's why I propose an alternative. Include it in the module file instead! Let's say you have a menu callback that loads up your module page (you'll see more about menus down below). "How do I do that?" you ask. Just a simple drupal_add_js will do the trick, but remember to include the path to the module:

{% highlight php startinline=true %}
function myModule_page_loader() { 
    drupal_add_js(drupal_get_path('module','myModule') . '/path/to/js.js'); 
    
    // Lets add some content to return so Drupal stays happy :) 
    $page = 'hello!';
    return $page;
}
{% endhighlight %}

## Drupal.settings

Of course you can't easily create a truely Drupal based module without getting help from Drupal settings or data from the database. Sure you can use Ajax to load in data, but what if you need some basic settings from Drupal, like administrative options set in a Drupal configuration menu? To add these settings, we're gonna need to transition to the '.module' file. We can add settings from a hook using the following pattern:

{% highlight php startinline=true %}
drupal_add_js(array('option' => 'optionValue'), 'setting');
{% endhighlight %}

Need more context? Try this example out:

{% highlight php startinline=true %}
function render_some_page($nid) { 
    // Lets load some some info about a node into our JS app. 
    $node = node_load($nid); 
    // For absolutely no good reason, say I want to have an alert 
    // display a nodes title and type. 
    drupal_add_js(array('title' => $node->title, 'type' => $node->type), 'setting'); 
    // Let's print out the body for fun! 
    return $node->body; 
}
{% endhighlight %}

## Menus

Yeah, maybe Menus aren't really a javascript thing, but they are much cleaner for loading data via XML HTTP Requests than using standard, unclean GET data. The main reason to do this is so you can avoid using standalone PHP scripts that just float in your modules folder. If you haven't worked with hook_menu yet, my advise is to think of it partially as a router. You set a path, a callback, arguments and then pass that data to a callback function that loads up data or a formatted drupal page or form. In our case, we just need our page to display raw JSON. Here's another quick sample to give you the gist of what needs to happen:

{% highlight php startinline=true %}
function myModule_menu() { 
    $items = array(); 
    $items['module_page/ajax/%'] = array( 
        'page callback' => 'myModule_get_json', 
        'page arguments' => array(3), 
        'access arguments' => array(1), 
        'type' => MENU_CALLBACK
        ); 
        return $items; 
} 

function myModule_get_json($nid) { 
    $node = node_load($nid); 
    $json = json_encode($node); 
    print($json);
}
{% endhighlight %}

##AHAH/AJAX

Guess what? Drupal's Form API has built in javascript tricks! You don't need to create another js file just to call an ajaxy form submission. This is one of the trickiest things to do in Drupal, so -- yeah, just be prepared for your first couple tries to fail. Here's the basic syntax:

{% highlight php startinline=true %}
function myModule_form() { 
    $form = array(); 
    $form['your name'] = array( 
        '#type' => 'textfield', 
        '#title' => t('Enter your name please')
        ); 
    $form['submit'] = array( 
        '#type' => 'submit', 
        '#submit' => 'do_form_save', 
        '#ajax' => array( 
            'callback' => 'do_form_save', // Send data here via ajax. 
            'wrapper' => 'id-of-wrapper', // Content that will be replaced. 
            'method' => 'replace' // This will replace the content of the wrapper with the returned result. 
            ), 
        ); 
    return $form; 
}
{% endhighlight %}

Of course there are tons of other options, which you should explore in Drupal's documentation on the [AJAX API](https://api.drupal.org/api/drupal/includes%21ajax.inc/group/ajax/7).
