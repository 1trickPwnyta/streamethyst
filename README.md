# streamethyst
Customize-able Node.js chatbot and overlay generator for Twitch streams

## Installation
**(currently untested)**

*Requires Node.js and MongoDB installation.*

1. Clone this repository using git clone.
2. Run "npm install" in the cloned directory.
3. Copy settings.js.x and name the copy settings.js.
4. Replace the example values in settings.js with your own.
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
