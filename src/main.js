/*
    ***** BEGIN LICENSE BLOCK *****
    
    Copyright © 2021 Corporation for Digital Scholarship
                     Vienna, Virginia, USA
                     http://digitalscholar.org/
    
    This file is part of Zotero.
    
    Zotero is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    Zotero is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    
    You should have received a copy of the GNU Affero General Public License
    along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
    
    ***** END LICENSE BLOCK *****
*/

let TurndownService = require('turndown/lib/turndown.browser.umd');
let turndownPluginGfm = require('turndown-plugin-gfm');

let turndownService = new TurndownService({
	headingStyle: 'atx',
	bulletListMarker: '-',
	emDelimiter: '*',
	codeBlockStyle: 'fenced'
});

turndownService.use(turndownPluginGfm.gfm);

// https://github.com/mixmark-io/turndown#overriding-turndownserviceprototypeescape
let escapes = [
	// [/\\/g, '\\\\'],
	[/\*/g, '\\*'],
	[/^-/g, '\\-'],
	[/^\+ /g, '\\+ '],
	[/^(=+)/g, '\\$1'],
	[/^(#{1,6}) /g, '\\$1 '],
	[/`/g, '\\`'],
	[/^~~~/g, '\\~~~'],
	// [/\[/g, '\\['],
	// [/\]/g, '\\]'],
	[/^>/g, '\\>'],
	// [/_/g, '\\_'],
	[/^(\d+)\. /g, '$1\\. '],
	// Custom corrections for the previous escapes
	// [/\\\[\\\[/g, '[['],
	// [/\\\]\\\]/g, ']]'],
	[/\\`\\`\\`/g, '```']
];

TurndownService.prototype.escape = function (string) {
	return escapes.reduce(function (accumulator, escape) {
		return accumulator.replace(escape[0], escape[1])
	}, string);
};

// https://github.com/mixmark-io/turndown/issues/291
turndownService.addRule('listItem', {
	filter: 'li',
	replacement: function (content, node, options) {
		content = content
		.replace(/^\n+/, '') // remove leading newlines
		 .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
		 .replace(/\n/gm, '\n    '); // indent
		var prefix = options.bulletListMarker + ' ';
		var parent = node.parentNode;
		if (parent.nodeName === 'OL') {
			var start = parent.getAttribute('start');
			var index = Array.prototype.indexOf.call(parent.children, node);
			prefix = (start ? Number(start) + index : index + 1) + '. ';
		}
		return (
			prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
		);
	}
});

function convert(doc) {
	// Transform `style="text-decoration: line-through"` nodes to <s> (TinyMCE doesn't support <s>)
	doc.querySelectorAll('span').forEach(function (span) {
		if (span.style.textDecoration === 'line-through') {
			let s = doc.createElement('s');
			s.append(...span.childNodes);
			span.replaceWith(s);
		}
	});

	// Turndown wants pre content inside additional code block
	doc.querySelectorAll('pre:not(.math)').forEach(function (pre) {
		let code = doc.createElement('code');
		code.append(...pre.childNodes);
		pre.append(code);
	});

	doc.querySelectorAll('p').forEach((p) => {
		let style = p.getAttribute('style');
		if (style) {
			let match = style.match(/padding-(left|right): ([0-9]+)px/);
			if (match) {
				let px = parseInt(match[2]);
				if (px > 0 && px % 40 === 0) {
					let level = px / 40;
					let spaces = '';
					for (let i = 0; i < level; i++) {
						spaces += '\u00A0\u00A0\u00A0\u00A0';
					}
					p.insertBefore(doc.createTextNode(spaces), p.firstChild);
					p.querySelectorAll('br').forEach((br) => {
						br.parentNode.insertBefore(doc.createTextNode(spaces), br.nextSibling);
					});
				}
			}
		}
	});
	
	// Insert a PDF link for highlight, underline and image annotation nodes
	doc.querySelectorAll('span[class="highlight"], span[class="underline"], img[data-annotation]').forEach(function (node) {
		try {
			var annotation = JSON.parse(decodeURIComponent(node.getAttribute('data-annotation')));
		}
		catch (e) {
		}

		if (annotation) {
			// annotation.uri was used before note-editor v4
			let uri = annotation.attachmentURI || annotation.uri;
			let position = annotation.position;
			if (Zotero.getOption("includeAppLinks")
				&& typeof uri === 'string'
				&& typeof position === 'object') {
				let openURI;
				let uriParts = uri.split('/');
				let libraryType = uriParts[3];
				let key = uriParts[uriParts.length - 1];
				if (libraryType === 'users') {
					openURI = 'zotero://open-pdf/library/items/' + key;
				}
				// groups
				else {
					let groupID = uriParts[4];
					openURI = 'zotero://open-pdf/groups/' + groupID + '/items/' + key;
				}
				
				let linkText;
				if (position.type === 'FragmentSelector') {
					openURI += '?cfi=' + encodeURIComponent(position.value);
					linkText = 'epub';
				}
				else if (position.type === 'CssSelector') {
					openURI += '?sel=' + encodeURIComponent(position.value);
					linkText = 'snapshot';
				}
				else {
					openURI += '?page=' + (position.pageIndex + 1);
					linkText = 'pdf';
				}
				if (annotation.annotationKey) {
					openURI += '&annotation=' + annotation.annotationKey;
				}

				let a = doc.createElement('a');
				a.href = openURI;
				a.append(linkText);
				let fragment = doc.createDocumentFragment();
				fragment.append(' (', a, ') ');
				
				let nextNode = node.nextElementSibling;
				if (nextNode && nextNode.classList.contains('citation')) {
					nextNode.parentNode.insertBefore(fragment, nextNode.nextSibling);
				}
				else {
					node.parentNode.insertBefore(fragment, node.nextSibling);
				}
			}
		}
	});
	
	// For now just insert a placeholder for embedded note images
	doc.querySelectorAll('img[data-attachment-key]').forEach(function (img) {
		img.replaceWith(doc.createTextNode('[image]'));
	});

	// Transform citations to links
	doc.querySelectorAll('span[class="citation"]').forEach(function (span) {
		try {
			var citation = JSON.parse(decodeURIComponent(span.getAttribute('data-citation')));
		}
		catch (e) {
		}

		if (citation && citation.citationItems && citation.citationItems.length) {
			let uris = [];
			for (let citationItem of citation.citationItems) {
				let uri = citationItem.uris[0];
				if (typeof uri === 'string') {
					let uriParts = uri.split('/');
					let libraryType = uriParts[3];
					let key = uriParts[uriParts.length - 1];
					if (libraryType === 'users') {
						uris.push('zotero://select/library/items/' + key);
					}
					// groups
					else {
						let groupID = uriParts[4];
						uris.push('zotero://select/groups/' + groupID + '/items/' + key);
					}
				}
			}

			let items = Array.from(span.querySelectorAll('.citation-item')).map(x => x.textContent);
			// Fallback to pre v5 note-editor schema that was serializing citations as plain text i.e.:
			// <span class="citation" data-citation="...">(Jang et al., 2005, p. 14; Kongsgaard et al., 2009, p. 790)</span>
			if (!items.length) {
				items = span.textContent.slice(1, -1).split('; ');
			}

			span.innerHTML = '(' + items.map((item, i) => {
				return Zotero.getOption('includeAppLinks')
					? `<a href="${uris[i]}">${item}</a>`
					: item
			}).join('; ') + ')';
		}
	});

	let text = turndownService.turndown(doc.body);

	// Remove lines with just two spaces which happens for `<p><br>test</p>`
	text = text.split('\n').filter((line) => line !== '  ').join('\n');
	return text;
}

bundle = { convert };
