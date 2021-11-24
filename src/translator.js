{
	"translatorID": "154c2785-ec83-4c27-8a8a-d27b3a2eded1",
	"label": "Note Markdown",
	"creator": "Martynas Bagdonas",
	"target": "md",
	"minVersion": "5.0.97",
	"maxVersion": "",
	"priority": 50,
	"configOptions": {
		"noteTranslator": true
	},
	"inRepository": true,
	"translatorType": 2,
	"lastUpdated": "2021-11-24 12:15:00"
}

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

let bundle;

function doExport() {
	Zotero.setCharacterSet('utf-8');
	let item;
	let first = true;
	while (item = Zotero.nextItem()) {
		if (item.itemType === 'note' || item.itemType === 'attachment') {
			let doc = new DOMParser().parseFromString(item.note || '', 'text/html');
			// Skip empty notes
			// TODO: Take into account image-only notes
			if (!doc.body.textContent.trim()) {
				continue;
			}
			if (!first) {
				Zotero.write('\n\n---\n\n');
			}
			first = false;
			Zotero.write(bundle.convert(doc));
		}
	}
}
