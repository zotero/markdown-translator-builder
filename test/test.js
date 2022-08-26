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

const expect = require('chai').expect;
var jsdom = require('jsdom');
let fs = require('fs');

global.Zotero = {
	getOption(name) {
		if (name === 'includeAppLinks') {
			return true;
		}
		throw new Error(`Unknown option '${name}'`);
	}
}

global.bundle = null;

// Loaded bundle assigns itself to 'bundle' variable which should
// exist in the current scope
require('../build/test-bundle');

convert = global.bundle.convert;

var dom = new jsdom.JSDOM('');
var parser = new dom.window.DOMParser();

describe('Markdown Translator', function () {
	it('should convert HTML to Markdown', async function () {

		let html = `
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <h4>Heading 4</h4>
  <h5>Heading 5</h5>
  <h6>Heading 6</h6>
  <p>Paragraph &nbsp; 1 - <strong>B</strong><em>I</em><u>U</u><span style="text-decoration: line-through">S</span><sub>2</sub><sup>2</sup><span style="color: #99CC00">T</span><span style="background-color: #99CC00">B</span><a href="g" rel="noopener noreferrer nofollow">L</a><code>C</code></p>

  <p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4" alt=""></p>
  <p><img src="https://static01.nyt.com/images/2020/07/30/science/30VIRUS-FUTURE3-jump/merlin_174267405_2f8e4d59-b785-4231-aea5-476014cc6306-jumbo.jpg?quality=90&auto=webp" alt=""></p>
	<p><img data-attachment-key="DDAAFF11"/></p>
	<p><span class="highlight" data-annotation="%7B%22attachmentURI%22%3A%22http%3A%2F%2Fzotero.org%2Fusers%2F4100175%2Fitems%2FFNAJ9YSE%22%2C%22pageLabel%22%3A%22796%22%2C%22position%22%3A%7B%22pageIndex%22%3A6%2C%22rects%22%3A%5B%5B259.03%2C402.442%2C292.362%2C415.207%5D%2C%5B62.249%2C391.731%2C292.373%2C401.147%5D%2C%5B62.249%2C379.769%2C292.359%2C389.184%5D%2C%5B62.249%2C367.807%2C267.885%2C377.222%5D%5D%7D%2C%22citationItem%22%3A%7B%22uris%22%3A%5B%22http%3A%2F%2Fzotero.org%2Fusers%2F4100175%2Fitems%2FG4VAML62%22%5D%2C%22locator%22%3A%22796%22%7D%7D">“HP and LP concentrations were unchanged from 0 to 12 weeks in all three groups and there were no differences in the relative changes between groups”</span> <span class="citation" data-citation="%7B%22citationItems%22%3A%5B%7B%22uris%22%3A%5B%22http%3A%2F%2Fzotero.org%2Fusers%2F4100175%2Fitems%2FG4VAML62%22%5D%2C%22locator%22%3A%22796%22%7D%5D%2C%22properties%22%3A%7B%7D%7D">(<span class="citation-item">Kongsgaard et al., 2009, p. 796</span>)</span></p>
	<p><img alt="" data-attachment-key="Y6GAPHKE" data-annotation="%7B%22attachmentURI%22%3A%22http%3A%2F%2Fzotero.org%2Fusers%2F4100175%2Fitems%2FFNAJ9YSE%22%2C%22annotationKey%22%3A%22TBU2AEXL%22%2C%22color%22%3A%22%23ffd400%22%2C%22pageLabel%22%3A%22791%22%2C%22position%22%3A%7B%22pageIndex%22%3A1%2C%22rects%22%3A%5B%5B43.47%2C79.741%2C285.662%2C298.867%5D%5D%7D%2C%22citationItem%22%3A%7B%22uris%22%3A%5B%22http%3A%2F%2Fzotero.org%2Fusers%2F4100175%2Fitems%2FG4VAML62%22%5D%2C%22locator%22%3A%22791%22%7D%7D" width="404" height="366"><br><span class="citation" data-citation="%7B%22citationItems%22%3A%5B%7B%22uris%22%3A%5B%22http%3A%2F%2Fzotero.org%2Fusers%2F4100175%2Fitems%2FG4VAML62%22%5D%2C%22locator%22%3A%22791%22%7D%5D%2C%22properties%22%3A%7B%7D%7D">(<span class="citation-item">Kongsgaard et al., 2009, p. 791</span>)</span></p>
	<p><span class="citation" data-citation="%7B%22citationItems%22%3A%5B%7B%22uris%22%3A%5B%22http%3A%2F%2Fzotero.org%2Fusers%2F4100175%2Fitems%2FUCXNVHMF%22%5D%7D%2C%7B%22uris%22%3A%5B%22http%3A%2F%2Fzotero.org%2Fusers%2F4100175%2Fitems%2FG4VAML62%22%5D%7D%5D%2C%22properties%22%3A%7B%7D%7D">(<span class="citation-item">Klambauer et al., 2017</span>; <span class="citation-item">Kongsgaard et al., 2009</span>)</span></p>
  <pre dir="rtl">Preformatted/code block - <strong>B</strong><em>I</em><u>U</u><span style="text-decoration: line-through">S</span><sub>2</sub><sup>2</sup><span style="color: #99CC00">T</span><span style="background-color: #99CC00">B</span><a href="g" rel="noopener noreferrer nofollow">L</a>C
1
	2
		3
			<a href="http://" rel="noopener noreferrer nofollow">4</a>
	</pre>
  <blockquote>
    <p>Blockquote (supports any node)</p>
    <h1>H</h1>
    <ol>
      <li>a</li>
    </ol>
  </blockquote>

	<table>
		<thead>
			<tr>
        <td>
          <p>a</p>
        </td>
        <td>
          <p>b</p>
        </td>
      </tr>
		</thead>
    <tbody>
      <tr>
        <td>
          <p>a</p>
        </td>
        <td>
          <p>b</p>
        </td>
      </tr>
    </tbody>
   </table>

  <ul>
    <li>
      <p>List (supports any node)</p>
      <ol>
        <li>
          One
        </li>
        <li>
          Two
        </li>
        <li>
          Three
        </li>
        <li>
          <p>Other</p>
        </li>
      </ol>
      <p></p>
    </li>
  </ul>

  <hr>

  <p style="padding-left: 40px" data-indent="1">indent 1</p>
  
  <p>[[]]</p>
  <p>a_b_c a _b_ c a __b__ c</p>
  <p>\`\`\`test</p>
`;
		let markdown = convert(parser.parseFromString(html, 'text/html'));

	let expectedMarkdown =
`# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

Paragraph   1 - **B***I*U~S~22TB[L](g)\`C\`

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4)

![](https://static01.nyt.com/images/2020/07/30/science/30VIRUS-FUTURE3-jump/merlin_174267405_2f8e4d59-b785-4231-aea5-476014cc6306-jumbo.jpg?quality=90&auto=webp)

[image]

“HP and LP concentrations were unchanged from 0 to 12 weeks in all three groups and there were no differences in the relative changes between groups” ([Kongsgaard et al., 2009, p. 796](zotero://select/library/items/G4VAML62)) ([pdf](zotero://open-pdf/library/items/FNAJ9YSE?page=7))

[image] ([pdf](zotero://open-pdf/library/items/FNAJ9YSE?page=2&annotation=TBU2AEXL))  
([Kongsgaard et al., 2009, p. 791](zotero://select/library/items/G4VAML62))

([Klambauer et al., 2017](zotero://select/library/items/UCXNVHMF); [Kongsgaard et al., 2009](zotero://select/library/items/G4VAML62))

\`\`\`
Preformatted/code block - BIUS22TBLC
1
\t2
\t\t3
\t\t\t4
\t
\`\`\`

> Blockquote (supports any node)
> 
> # H
> 
> 1. a

| 
a

 | 

b

 |
| --- | --- |
| 

a

 | 

b

 |

- List (supports any node)
    
    1. One
    2. Two
    3. Three
    4. Other
        
    

* * *

    indent 1

[[]]

a_b_c a _b_ c a __b__ c

\`\`\`test`;

		expect(expectedMarkdown).to.equal(markdown);
	});
});
