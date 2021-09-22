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
	doc.querySelectorAll('pre').forEach(function (pre) {
		let code = doc.createElement('code');
		code.append(...pre.childNodes);
		pre.append(code);
	});
	
	// Insert a PDF link for highlight and image annotation nodes
	doc.querySelectorAll('span[class="highlight"], img[data-annotation]').forEach(function (node) {
		try {
			var annotation = JSON.parse(decodeURIComponent(node.getAttribute('data-annotation')));
		}
		catch (e) {
		}

		if (annotation) {
			// annotation.uri was used before note-editor v4
			let uri = annotation.attachmentURI || annotation.uri;
			let position = annotation.position;
			if (typeof uri === 'string' && typeof position === 'object') {
				let openURI;
				let uriParts = uri.split('/');
				let libraryType = uriParts[3];
				let key = uriParts[6];
				if (libraryType === 'users') {
					openURI = 'zotero://open-pdf/library/items/' + key;
				}
				// groups
				else {
					let groupID = uriParts[4];
					openURI = 'zotero://open-pdf/groups/' + groupID + '/items/' + key;
				}
				
				openURI += '?page=' + (position.pageIndex + 1)
					+ (annotation.annotationKey ? '&annotation=' + annotation.annotationKey : '');
				
				let a = doc.createElement('a');
				a.href = openURI;
				a.append('pdf');
				let fragment = doc.createDocumentFragment();
				fragment.append(' (', a, ') ');
				
				let nextNode = node.nextElementSibling;
				if (nextNode.classList.contains('citation')) {
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
					let key = uriParts[6];
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
				return `<a href="${uris[i]}">${item}</a>`
			}).join('; ') + ')';
		}
	});

	return turndownService.turndown(doc.body);
}

bundle = { convert };
