/*
 * ajaxloadContent.js
 *
 * Get the latest version from:
 *
 * http://www.jsclasses.org/ajax-load-content
 *
 * @(#) $Id: ajaxLoadContent.js,v 1.8 2014/10/28 07:19:50 mlemos Exp $
 *
 *
 * This LICENSE is in the BSD license style.
 *
 * Copyright (c) 2014, Manuel Lemos
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

/*jslint sloppy: true, white: true, browser: true, evil: true, plusplus: true */

if(ML === undefined)
{
	var ML = {};
}
if(ML.content === undefined)
{
	ML.content = {};
}
ML.content.ajaxLoadContent = function()
{
	var doNotRemoveThisGetTheLatestVersionFrom = 'http://www.jsclasses.org/ajax-load-content';

	this.error = "";

	this.jsonResponseHeader = true;

	this.xhr = null;

	this.sendRequest = function(options)
	{
		var o = this;

		if(!o.xhr)
		{
			if(typeof XMLHttpRequest !== "function"
			&& typeof XMLHttpRequest !== "object")
			{
				try
				{
					o.xhr = new ActiveXObject("MSXML2.XMLHTTP.3.0");
				}
				catch(e)
				{
					this.error = 'XMLHttpRequest is not supported '+ typeof XMLHttpRequest;
					return false;
				}
			}
			else
			{
				o.xhr = new XMLHttpRequest();
			}
		}
		o.xhr.onreadystatechange = function()
		{
			var header, response, body, length, lineBreak, json;

			if(o.xhr.readyState === 4)
			{
				if(o.xhr.status === 200)
				{
					body = o.xhr.responseText;
					header = null;
					if(o.jsonResponseHeader)
					{
						lineBreak = body.indexOf("\n");
						if(lineBreak !== -1)
						{
							length = parseInt(body.substr(0, lineBreak), 10);
							if(!isNaN(length)
							&& length > 0)
							{
								json = body.substr(lineBreak + 1, length);
								if(typeof JSON === "object")
								{
									try
									{
										header = JSON.parse(json);
										body = body.substr(lineBreak + 1 + length);
									}
									catch(e)
									{
										header = null;
									}
								}
								else
								{
									o.error = 'parsing JSON responses is not supported';
									if(options.failed)
									{
										options.failed(o);
									}
								}
							}
						}
					}
					if(options.succeeded)
					{
						response = { body: body };
						if(header !== null)
						{
							response.header = header;
						}
						options.succeeded(o, response);
					}
				}
				else
				{
					o.error = o.xhr.status;
					if(options.failed)
					{
						options.failed(o);
					}
				}
			}
		};
		o.xhr.open(options.method, options.url);
		if(typeof options.formData === "object")
		{
			o.xhr.send(options.formData);
		}
		else
		{
			if(typeof options.request === "string")
			{
				o.xhr.setRequestHeader("Content-type", options.contentType ? options.contentType : "application/x-www-form-urlencoded");
				o.xhr.send(options.request);
			}
			else
			{
				o.xhr.send(null);
			}
		}
		return true;
	};

	this.loadContent = function(url, succeeded, failed)
	{
		var options;
		
		options = { url: url, method: "get", succeeded: succeeded, failed: failed };
		return this.sendRequest(options);
	};

	this.encodeURI = function(value)
	{
		return encodeURIComponent(value).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A").replace(/%20/g, "+");
	};

	this.sendForm = function(options)
	{
		var element, request, e, send, values, v;
		
		if(!options.form)
		{
			this.error = "it was not specified a form element to submit";
			return false;
		}
		element = document.getElementById(options.form);
		if(!element)
		{
			this.error = options.form + " is not a valid form element";
			return false;
		}
		request = "";
		if(typeof window.FormData === "function"
		&& element.method.toLowerCase() === "post")
		{
			options.formData = new window.FormData(element);
			if(options.submit)
			{
				for(e = 0; e < element.length; ++e)
				{
					if(options.submit && element[e].name && element[e].name === options.submit)
					{
						options.formData.append(element[e].name, element[e].value);
						break;
					}
				}
			}
		}
		else
		{
			for(e = 0; e < element.length; ++e)
			{
				values = [];
				switch(element[e].type)
				{
					case "radio":
					case "checkbox":
						send = element[e].checked;
						break;
					case "submit":
					case "image":
						send = (options.submit && element[e].name && element[e].name === options.submit);
						break;
					case "hidden":
					case "text":
					case "textarea":
					case "password":
						send = true;
						break;
					case "reset":
					case "button":
						send = false;
						break;
					case "select":
					case "select-one":
						send = false;
						values = [ element[e].options[element[e].selectedIndex].value ];
						break;
					case "select-multiple":
						send = false;
						for(v = 0; v < element[e].options.length; v++)
						{
							if(element[e].options[v].selected)
							{
								values[values.length] = element[e].options[v].selected;
							}
						}
						break;
					default:
						this.error = "submitting forms with inputs of type " + element[e].type + " is not supported";
						return false;
				}
				if(send)
				{
					values = [ element[e].value ];
				}
				for(v = 0; v < values.length; v++)
				{
					request = (request.length ? request + "&" : "") + this.encodeURI(element[e].name) + "=" + this.encodeURI(values[v]);
				}
			}
		}
		options.url = element.action;
		options.method = element.method;
		if(element.method.toLowerCase() === "post")
		{
			if(!options.formData)
			{
				options.request = request;
			}
		}
		else
		{
			if(request.length)
			{
				options.url = options.url + (options.url.indexOf("?") === -1 ? "?" : "&") + request;
			}
		}
		return this.sendRequest(options);
	};

	this.submitForm = function(form, submit, succeeded, failed)
	{
		var options = { form: form, submit: submit, succeeded: succeeded, failed: failed };
		return this.sendForm(options);
	};

	this.loadCode = function(element, html)
	{
		var code, head, script;

		code = "";
		html = html.replace(/<script[^>]*>([\s\S]*)<\/script>/mgi, function()
		{
			code += arguments[1].replace(/^<!--/mg, "").replace(/-->$/mg, "") + "\n";
			return "";
		});
		document.getElementById(element).innerHTML = html;
		if(window.execScript)
		{
			window.execScript(code);
		}
		else
		{
			head = document.getElementsByTagName("head")[0];
			script = document.createElement("script");
			script.setAttribute("type", "text/javascript");
			script.innerText = code;
			head.appendChild(script);
			head.removeChild(script);
		}
	};
};