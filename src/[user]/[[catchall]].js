import * as cheerio from 'cheerio';
import { h } from 'preact';
import { renderToStaticMarkup } from 'preact-render-to-string';

function render(oembedResponse) {
	const $ = cheerio.load(oembedResponse.html)
	const contentEl = $('.twitter-tweet p')
	contentEl.find('br').replaceWith(' ')
	const content = contentEl.prop('innerText')

	// console.log(oembedResponse)

	return `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width">
		${renderToStaticMarkup([
			h("title", null, [oembedResponse.author_name, ': "', content, '" / Twitter']),
			h("meta", {property: "og:site_name", content: "Twitter"}),
			h("meta", {property: "og:title", content: oembedResponse.author_name}),
			h("meta", {property: "og:description", content: content}),
		])}
		<style>
			.guide {
				text-align: center;
			}
			.guide a {
				color: rgb(0, 111, 214);
				display: inline-block;
				text-decoration: none;
				padding: 10px;
				font-size: 14px;
				font-weight: bold;
			}
		</style>
	</head>
	<body>
		<div class="guide">
			<a href="/">🔗 Make public link to tweets like this</a>
		</div>
		${oembedResponse.html}
	</body>
</html>`
}

export async function onRequest(context) {
	let url = context.params.catchall || []
	url = [context.params.user].concat(url)
	url = url.join('/')
	if (url.indexOf('twitter.com') !== 0) {
		url = 'twitter.com/' + url
	}
	url = 'https://' + url
	const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&align=center`
	const response = await fetch(oembedUrl)
	const oembedResponse = await response.json()
	return new Response(render(oembedResponse), {
		headers: {
			'content-type': 'text/html',
		}
	})
}
