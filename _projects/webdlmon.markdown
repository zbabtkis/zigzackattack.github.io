---
title: The Data Logger Monitor
screenshot: webdlmon.png
link: http://webdlmon.nees.ucsb.edu:8888/
technologies:
  - Backbone
  - MarionetteJS
  - Python
  - Node
  - Websockets
---
The WebDLMon as we call it at NEES offers a real-time display of current temperatures, voltage stats and more. I used WebSockets (Socket.io) as an alternative to AJAX to allow our researchers to keep the window open at all times without refreshing (nice to know ASAP when a machine stops reporting). The front end is written in Backbone Marionette and is written with maintainability and adaptability in mind. Check out the source [on Github](https://github.com/zigzackattack/webdlmon).
