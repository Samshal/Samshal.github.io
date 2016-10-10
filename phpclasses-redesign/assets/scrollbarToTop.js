/*
 * scrollbarToTop.js
 *
 * Get the latest version from:
 *
 * http://www.jsclasses.org/scrollbar-to-top
 *
 * @(#) $Id: scrollbarToTop.js,v 1.1 2013/10/29 01:17:35 mlemos Exp $
 *
 *
 * This LICENSE is in the BSD license style.
 * *
 * Copyright (c) 2013, Manuel Lemos
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 *   Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 *   Neither the name of Manuel Lemos nor the names of his contributors
 *   may be used to endorse or promote products derived from this software
 *   without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

/*jslint browser: true, sloppy: true, white: true */

var ML;

if(ML === undefined)
{
	ML = {};
}
if(ML.content === undefined)
{
	ML.content = {};
}
ML.content.scrollbarToTop = function()
{
	var doNotRemoveThisGetTheLatestVersionFrom = 'http://www.jsclasses.org/scrollbar-to-top',

	addEventListener = function(element, event, callback)
	{
		if(element.addEventListener)
		{
			element.addEventListener(event, callback, false);
			return true;
		}
		if(element.attachEvent)
		{
			element.attachEvent('on' + event, callback);
			return true;
		}
		return false;
	},
	
	getElementSize = function(element)
	{
		if(element.clip !== undefined)
		{
			return { width: element.clip.width, height: element.clip.height };
		}
		return { width: element.offsetWidth, height: element.offsetHeight };
	},

	getElementScroll = function(element)
	{
		return { x: element.scrollLeft, y: element.scrollTop };
	},

	setElementScrollLeft = function(element, x)
	{
		element.scrollLeft = x;
	};

	/*
	 * Returns an error message when a function call fails.
	 */
	this.error = '';

	/*
	 * tabindex attribute for divs with scrollbar
	 * Any non-negative value will make the content element
	 * get keyboard focus when the mouse is over
	 */
	this.tabIndex = 0;

	this.addTopScrollbar = function(element)
	{
		var e, p, c, b, bc, s;
		
		e = document.getElementById(element);
		if(!e)
		{
			this.error = element + ' is not a valid content element';
			return false;
		}
		c = document.createElement('div');
		c.setAttribute('style', 'overflow-x: auto; overflow-y: hidden;');
		if(this.tabIndex >= 0)
		{
			c.setAttribute('tabindex', this.tabIndex);
		}
		p = e.parentNode;
		p.insertBefore(c, e);
		p.removeChild(e);
		c.appendChild(e);
		bc = document.createElement('div');
		bc.setAttribute('style', 'overflow-x: auto; overflow-y: hidden;');
		p.insertBefore(bc, c);
		b = document.createElement('div');
		s = getElementSize(e);
		b.setAttribute('style', 'width: ' + s.width + 'px; height: 1px;');
		bc.appendChild(b);
		addEventListener(bc, 'scroll', function() { setElementScrollLeft(c, getElementScroll(bc).x); });
		addEventListener(c, 'scroll', function() { setElementScrollLeft(bc, getElementScroll(c).x); });
		if(this.tabIndex >= 0)
		{
			addEventListener(c, 'mouseover', function() { c.focus(); });
		}
		return true;
	};
};
