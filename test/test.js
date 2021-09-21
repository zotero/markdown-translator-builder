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
var jsdom = require('jsdom')

let fs = require('fs')

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

  <p><span class="highlight" data-annotation="%7B%22parentURI%22%3A%22http%3A%2F%2Fzotero.org%2Fusers%2F3820982%2Fitems%2FRSBTC6WA%22%2C%22uri%22%3A%22http%3A%2F%2Fzotero.org%2Fusers%2F3820982%2Fitems%2FPH3XGS7W%22%2C%22position%22%3A%7B%22pageIndex%22%3A4%2C%22rects%22%3A%5B%5B320.40026855%2C344.76534922848003%2C544.8284741526363%2C355.92280274877004%5D%2C%5B306.24053955%2C331.56332285848003%2C544.2454691574964%2C343.1658668218%5D%2C%5B306.24005126%2C318.60375864848004%2C454.4506083824394%2C329.76121216877004%5D%5D%7D%7D">"The Z’ factor is a useful tool for evaluating bioassay qualities[17]. In general, a Z’ value above 0.5 suggests that an assay is robust enough for HTS."</span> <span class="citation" data-citation="%7B%22citationItems%22%3A%5B%7B%22uris%22%3A%5B%22http%3A%2F%2Fzotero.org%2Fusers%2F3820982%2Fitems%2FRSBTC6WA%22%5D%2C%22locator%22%3A%225%22%7D%5D%2C%22properties%22%3A%7B%7D%7D">{citation}</span></p>
	<p><span class="citation" data-citation="%7B%22citationItems%22%3A%5B%7B%22uris%22%3A%5B%22http%3A%2F%2Fzotero.org%2Fusers%2F3820982%2Fitems%2F5WHB5RZX%22%5D%2C%22itemData%22%3A%7B%22id%22%3A1780%2C%22type%22%3A%22article-journal%22%2C%22container-title%22%3A%22n%20engl%20j%20med%22%2C%22language%22%3A%22en%22%2C%22page%22%3A%223%22%2C%22source%22%3A%22Zotero%22%2C%22title%22%3A%22Not%20a%20Perfect%20Storm%20%E2%80%94%20Covid-19%20and%20the%20Importance%20of%20Language%22%2C%22author%22%3A%5B%7B%22family%22%3A%22Brandt%22%2C%22given%22%3A%22Allan%20M%22%7D%2C%7B%22family%22%3A%22Botelho%22%2C%22given%22%3A%22Alyssa%22%7D%5D%2C%22issued%22%3A%7B%22date-parts%22%3A%5B%5B%222020%22%5D%5D%7D%7D%2C%22locator%22%3A%221494%22%7D%5D%2C%22properties%22%3A%7B%7D%7D">(Brandt and Botelho, 2020, p. 1494)</span></p>
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

\\[image\\]

"The Z’ factor is a useful tool for evaluating bioassay qualities\\[17\\]. In general, a Z’ value above 0.5 suggests that an assay is robust enough for HTS." [open PDF](zotero://select/library/items/PH3XGS7W) ([citation](zotero://select/library/items/RSBTC6WA))

([Brandt and Botelho, 2020, p. 1494](zotero://select/library/items/5WHB5RZX))

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
> 1.  a

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

-   List (supports any node)
    
    1.  One
    2.  Two
    3.  Three
    4.  Other
        
    

* * *

indent 1`;

		expect(expectedMarkdown).to.equal(markdown);
	});
});
