# gistify-markdown

Easily transform your Markdown documents, replacing every code block with a Gist.

I've written it for my personal use case. I'm writing blogposts on [Medium](http://medium.com) which does not support syntax highlighting for code snippets. Since I'm using [iA Writer] to do that, I have source files for my blogposts which are Markdown documents.

This script takes advantage of having my blogposts as Markdown files & is replacing every code block with a gist. That's why it's missing some features (like understanding every language code and its extension) and is written in a rather crude way.

## Installation

```
npm install -g gistify-markdown
```

Or if you'd like to develop this project:

```
git clone https://github.com/Killavus/gistify-markdown.git
```

## Usage

```
gistify-markdown <input file> [GitHub token]
```

GitHub token is not necessary (it allows you to publish gists owned by your GitHub account).

To obtain the token, issue the following request using `curl`:

```
curl -u '<your-username>' -d '{ "scopes": ["gist"], "note": "For gistify-markdown utility", "note_url": "https://github.com/Killavus/gistify-markdown" }' https://api.github.com/authorizations
```

If you're using two-factor auth on GitHub, the command looks like:

```
curl -u '<your-username>' -d '{ "scopes": ["gist"], "note": "For gistify-markdown utility", "note_url": "https://github.com/Killavus/gistify-markdown" }' -H 'X-GitHub-OTP: <your-2fa-code>' https://api.github.com/authorizations
```

As the response you'll get the JSON. The `"token"` field is what interests you - store it somewhere.

## Contributing

You can use GitHub issues or make a pull request if you want to contribute to this project. See [here](https://guides.github.com/activities/contributing-to-open-source/) for details.

## License

ISC.

