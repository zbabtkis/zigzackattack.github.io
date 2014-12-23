---
layout: post
title: Converting a field in Drupal
date:  2014-03-10 13:32:12
image: convert-drupal-field/feature.jpg
categories: drupal mysql
---
If you haven't ever checked out Drupal's relational database, you're in for a good scare. You might assume that each node would be a row in a table and when you visit a page, the node is retrieved and rendered from that single row. Well, actually, Drupal keeps data from every field on that node in a separate table. If you care to check out the tables in MySQL, you'll see ones called field_data_field_body and field_revision_field_body. The entries in those tables each have a node id reference, field value, field language and some other information you probably don't care about. Since any "body" field requires the exact same information regardless of which node it appears in, Drupal stores all body content in this one table. Pretty cool right?

Everything's good until you realize that you screwed up big time -- when you first set up the site, you created a plain text field for links. Of course you should have used the link field (from the "link" module) instead. "Dammit!" you exclaim. You've already created a bunch of nodes using this useless text only value. Don't fret my friend. You're about to discover the power of SQL.

More interesting than the separation of field data is the way the schema of these fields works. When you create a field type while defining a new content type in Drupal, Drupal says "hey, if I need to store a link here, I'll need more information than just text. So Drupal creates a new schema containing fields for the URL value, the title of the link and possibly more.

Our plain text link table already contains the URL so really all we need to do is map the plain text URL to the link field's url value. Data fields in the drupal database begin with field_data, so our new url link data will go into field_data_field_url. Note that field_url_url is the name of the url value of our 'url' field, hence the double 'url'. field_link_value is the name of our old plain text link field value.

Quick aside: I'm using a command line tool called "drush" here. If you aren't already using it in your Drupal workflow, you should definitely check it out. You can query the drupal database, install modules, enable themes and much more with it. Okay... now to the code:

{% highlight bash %}
drush sql-query "
    INSERT INTO 
        field_data_field_url (
            entity_type, 
            bundle, 
            deleted, 
            entity_id, 
            revision_id, 
            language, 
            delta, 
            field_url_url
        ) 
        SELECT 
            entity_type, 
            bundle, 
            deleted, 
            entity_id, 
            revision_id, 
            language, 
            delta, 
            field_link_value as field_url_url 
        FROM 
            field_data_field_link"
{% endhighlight %}

Notice I've mapped the field_link_value result in the nested SELECT statement to the field_url_url field. That way, the link_value field will be inserted into the correct column in the new table. The other fields are standard for most field types. 

But we also need to give each link attributes field a blank serialized attributes array (that's just the way Drupal instantiates new rows).

{% highlight bash %}
drush sql-query "
    UPDATE 
        field_data_field_url 
    SET 
        field_url_attributes='a:0:{}'"
{% endhighlight %}

Blammo! You've got yourself a link field with all of your original data. You can go ahead and delete the old field if you want (and you probably do) from the content type.
