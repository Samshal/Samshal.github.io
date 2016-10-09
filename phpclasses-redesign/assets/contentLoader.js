/*
 * contentLoader.js
 *
 * Get the latest version from:
 *
 * http://www.jsclasses.org/fast-content-loader
 *
 * @(#) $Id: contentLoader.js,v 1.16 2012/11/10 03:23:02 mlemos Exp $
 *
 *
 * This LICENSE is in the BSD license style.
 * *
 * Copyright (c) 2010, Manuel Lemos
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
 *  Portions of the code that implement document write capture are based
 *  on the Bezen library by Eric Brechemier licensed under the Creative
 *  Commons Attribution license 3.0:
 *
 *  http://creativecommons.org/licenses/by/3.0/ 
 *
 *  http://bezen.org/javascript/
 */

var ML;

if(ML === undefined)
{
	ML = {};
}
if(ML.content === undefined)
{
	ML.content = {};
}
ML.content.contentLoader = function()
{
	this.debug = false;
	this.defaultInline = false;
	this.updateInterval = 10;
	this.contentPrefix = 'con';
	this.delayedPrefix = 'del';
	this.delayedContent = '&nbsp;';

	var doNotRemoveThisGetTheLatestVersionFrom = 'http://www.jsclasses.org/fast-content-loader',
		content = [],
		update = null,

	outputDebug = function(o, message)
	{
		if(o.debug)
		{
			if(console
			&& console.log)
			{
				console.log(message);
			}
			else
			{
				alert(message);
			}
		}
		return false;
	},

	replaceContent = function()
	{
		var remaining = 0, c, delayed, place;

		for(c in content)
		{
			if(content.hasOwnProperty(c))
			{
				if(!content[c].loaded)
				{
					delayed = document.getElementById(content[c].delayed);
					place = document.getElementById(content[c].id);
					if(delayed
					&& place)
					{
						delayed.parentNode.removeChild(delayed);
						place.parentNode.replaceChild(delayed, place);
						delayed.style.display = (content[c].inline ? ((content[c].width || content[c].height) ? 'inline-block' : 'inline') : 'block');
						content[c].loaded = true;
					}
					else
					{
						++remaining;
					}
				}
			}
		}
		if(remaining === 0)
		{
			window.clearInterval(update);
			update = null;
		}
		return remaining;
	};

	this.addContent = function(properties)
	{
		var i, m;

		if(!properties.content)
		{
			return outputDebug(this, 'Content properties are missing');
		}
		properties.id = this.contentPrefix + content.length;
		properties.delayed = this.delayedPrefix + content.length;
		if(properties.inline === undefined)
		{
			properties.inline = this.defaultInline;
		}
		properties.loaded = false;
		if(typeof properties.priority !== 'number')
		{
			properties.priority = 0;
		}
		document.write('<div id="' + properties.id + '" style="' + (properties.width ? 'width: ' + properties.width + 'px;' : '') + (properties.height ? ' height: ' + properties.height + 'px;' : '') + ' overflow: none; display: ' + (properties.inline ? ((properties.width || properties.height) ? 'inline-block' : 'inline') : 'block') + '">' + this.delayedContent + '</div>');
		for(i = content.length; i > 0 && content[i - 1].priority < properties.priority; --i)
		{
		}
		for(m = content.length; m > i; --m)
		{
			content[m] = content[m - 1];
		}
		content[i] = properties;
		return true;
	};
	
	this.loadContent = function()
	{
		var o = this,
			written,
			write,
			writeln,
			reportError,
			catchError,
			trim,
			hasAttribute,
			moveScript,
			moveScriptClone,
			moveNodes,
			insertWritten,
			load,
			c;

		if(window.opera
		|| navigator.userAgent.indexOf('MSIE') !== -1)
		{
			written = [];

			write = function(html)
			{
				written.push(html);
			};

			writeln = function(html)
			{
				write(html + "\n");
			};

			reportError = function(error, url, line)
			{
				if(typeof error === 'object')
				{
					reportError(error.message, error.fileName, error.lineNumber);
					return;
				}
				outputDebug(o, error + ' at ' + url + '[' + line + ']');
			};
 
			catchError = function(func, description)
			{
				var f;

				description = description || 'error.catchError';
				if(typeof func !== 'function')
				{
					reportError(description + ': A function is expected, found ' + typeof func);
					f = function() { };
					return f;
				}
				f = function()
				{
					try
					{
						return func.apply(this,arguments);
					}
					catch(e)
					{
						if(window.onerror)
						{
							window.onerror(description + ': ' + e.message + ' in ' + func, e.fileName, e.lineNumber, true);
						}
					}
				};
				return f;
			};

			trim = function(text)
			{
				return(text.replace(/^\s*/, '').replace(/\s*$/, ''));
			};

			hasAttribute = function(node, attribute)
			{
				if(node.hasAttribute)
				{
					return node.hasAttribute(attribute);
				}
 
				var attributeNode = node.getAttributeNode(attribute);

				if(attributeNode === null)
				{
					return false;
				}
				return attributeNode.specified;
			};

			moveScript = function(script, target, callback)
			{
				var safeCallback = catchError(callback, 'script.onload');
 
				if(script.readyState
				&& script.onload !== null)
				{
					script.onreadystatechange = function()
					{
						if(script.readyState === 'loaded'
						|| script.readyState === 'complete')
						{
							script.onreadystatechange = null;
							script.onerror = null;
							safeCallback();
						}
					};
				}
				else
				{
					script.onload = safeCallback;
				}
				target.appendChild(script);
			};

			moveScriptClone = function(script, target, callback)
			{
				var externalScript, internalScript, i, attribute, code;

				if(hasAttribute(script, 'src'))
				{
					externalScript = document.createElement('script');
					for(i = 0; i < script.attributes.length; ++i)
					{
						attribute = script.attributes[i];
						if(hasAttribute(script, attribute.name))
						{
							externalScript.setAttribute(attribute.name, attribute.value);
						}
					}
					externalScript.text = script.text;
					moveScript(externalScript, target, callback);
				}
				else
				{
					internalScript = script.cloneNode(false);
					internalScript.text = script.text;
					internalScript.type = 'any';
					target.appendChild(internalScript);
					if(hasAttribute(script, 'type'))
					{
						internalScript.setAttribute('type', script.type);
					}
					else
					{
						internalScript.removeAttribute('type');
					}
					code = trim(internalScript.text);
					if(code.indexOf('<!--') === 0)
					{
						code = code.substr(4);
						if(code.substr(code.length - 3) === '-->')
						{
							code = code.substr(0, code.length - 3);
						}
					}
					(new Function(code))();
					callback();
				}
			};
 
			moveNodes = function(source, target, callback)
			{
				var nextSource, nextTarget, nextStep, clone, scriptCount, sourceAncestor;

				if(source === null)
				{
					callback();
					return;
				}
				nextSource = null;
				nextTarget = target;

				nextStep = function()
				{
					moveNodes(nextSource, nextTarget, callback);
				};
 
				if(source.nodeName === 'SCRIPT'
				&& (!source.language
				|| source.language.toLowerCase() === 'javascript')
				&& (!source.type
				|| trim(source.type).toLowerCase() === 'text/javascript'))
				{
					setTimeout(function()
					{
						moveScriptClone(source, target, function()
						{
							insertWritten(target, nextStep);
						});
					}, 0);
				}
				else
				{
					clone = source.cloneNode(false);
					target.appendChild(clone);
					setTimeout(nextStep, 0);
					if(source.firstChild)
					{
						scriptCount = source.getElementsByTagName('script').length;
						if(scriptCount === 0)
						{
							if(source.nodeName === 'TABLE')
							{
								clone.outerHTML = source.outerHTML;
							}
							else
							{
								clone.innerHTML = source.innerHTML;
							}
						}
						else
						{
							nextSource = source.firstChild;
							nextTarget = clone;
						}
					}
				}
				if(nextSource === null)
				{
					nextSource = source.nextSibling;
				}
				sourceAncestor = source.parentNode;
				while(nextSource === null
				&& sourceAncestor !== null)
				{
					nextSource = sourceAncestor.nextSibling;
					nextTarget = nextTarget.parentNode;
					sourceAncestor = sourceAncestor.parentNode;
				}
			};

			insertWritten = function(target, callback)
			{
				if(written.length > 0)
				{
					var div = document.createElement('div');
					div.innerHTML = '<br>' + written.join('');
					written = [];
					div.removeChild(div.firstChild);
					moveNodes(div.firstChild, target, callback);
				}
				else
				{
					callback();
				}
			};

			load = function()
			{
				var documentWrite = document.write,
					documentWriteln = document.writeln,
					loadContentElement;
				document.write = write;
				document.writeln = writeln;
				loadContentElement = function (c)
				{
					var div = document.getElementById(content[c].id);
					div.innerHTML = '';
					write(content[c].content);
					insertWritten(div, function ()
					{
						content[c].loaded = true;
						++c;
						if(c < content.length)
						{
							loadContentElement(c);
						}
						else
						{
							document.writeln = documentWriteln;
							document.write = documentWrite;
						}
					});
				};
				loadContentElement(0);
			};

			if(content.length)
			{
				if(window.addEventListener)
				{
					window.addEventListener('load', load, false);
				}
				else
				{
					if(window.attachEvent)
					{
						window.attachEvent('onload', load);
					}
					else
					{
						if(document.addEventListener)
						{
							document.addEventListener('load', load, false);
						}
						else
						{
							document.attachEvent('onload', load);
						}
					}
				}
			}
		}
		else
		{
			for(c in content)
			{
				if(content.hasOwnProperty(c))
				{
					if(!content[c].loaded)
					{
						document.write('<div id="' + content[c].delayed + '" style="' + (content[c].width ? 'width: ' + content[c].width + 'px;' : '') + (content[c].height ? ' height: ' + content[c].height + 'px;' : '') + ' overflow: none; display: none">' + content[c].content + '</div>');
					}
				}
			}
			if(replaceContent()
			&& update === null)
			{
				update = window.setInterval(function()
				{
					replaceContent();
				}, this.updateInterval);
			}
		}
	};
};
