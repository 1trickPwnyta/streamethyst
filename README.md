# streamethyst
Customize-able Node.js chatbot and overlay generator for Twitch streams

## Installation
**(currently untested)**

*Requires Node.js and MongoDB installation.*

1. Clone this repository using git clone.
2. Run "npm install" in the cloned directory.
3. Copy settings.json.x and name the copy settings.json.
4. Replace the example values in settings.json with your own.
    * chatbot passwords are not Twitch user passwords and instead should be obtained from https://twitchapps.com/tmi/
    * api credentials can be obtained using https://d-fischer.github.io/twitch-chat-client/docs/examples/basic-bot.html
3. Run "npm start" to launch streamethyst.

## Features

### Quotes
Quotes is a built-in feature in streamethyst that uses the !quote command.

#### !quote
Displays the retrieved quote including the date on which it was added.
* syntax:

      !quote $number

* $number (optional): The quote number to retrieve. If not provided, a random quote will be retrieved.

#### !quote search
A random quote matching the search term will be retrieved.
* aliases: !searchquote
* syntax:

      !quote search $term

* $term: The term to search quotes for. Regular expressions are allowed.

#### !quote add
Adds a quote.
* aliases: !addquote
* syntax:

      !quote add $quote

* $quote: The quote to add.

#### !quote delete
Deletes a quote. Only channel owners/moderators can use this command.
* aliases: !deletequote
* syntax:

      !quote delete $number

* $number: The quote number to delete.

## Stream Overlay
streamethyst includes a stream overlay that can be accessed at http://localhost:9095 (or whichever port you use in settings.js) while streamethyst is running. Some commands may trigger audio or visual effects on the overlay, such as sound commands.

## Custom Plugins
streamethyst is specifically designed to be extremely customizable! Plugins are Javascript files that adhere to a specific format and go in the plugins folder or any subfolder therein. Plugins are loaded at startup and are triggered each time certain events occur.

### Events

#### chatbot.connect
Called when the chatbot has connected to Twitch after streamethyst starts up.

#### chatbot.command.{\*}
Called when a user in chat enters a specific command (any message that beings with the commandPrefix in settings.js).

### Triggering Plugins
Plugins register for one or more events. When the event is called, each plugin registered for that event will be triggered, in no particular order.

### Creating a Custom Plugin
streamethyst comes with some examples of how to use custom plugins, which can be found in the plugins folder. The built-in quote command is also implemented using a plugin, which can be reviewed for a much more complex example.
