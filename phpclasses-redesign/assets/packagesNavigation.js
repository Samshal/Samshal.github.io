/*
 * packagesNavigation.js
 *
 * @(#) $Id: packagesNavigation.js,v 1.13 2015/06/06 08:16:49 mlemos Exp $
 *
 */

/*jslint browser: true, devel: true, evil: true, plusplus: true, regexp: true, sloppy: true, white: true */

var ViewContent = function()
{
	this.previous = "files";
	this.loadingIcon = "";
	this.loadedFile = null;
	this.loadingElement = "loading_file";
	this.fileData = "file_data";
	this.fileFormat = "content";
	this.initialContent = "files";
	this.debug = 0;

	this.setContent = function(current)
	{
		var a, effects;
		
		effects = [];
		if(this.previous !== null)
		{
			effects.push({
				type: "Hide",
				element: this.previous,
				visibility: "display"
			});
		}
		effects.push({
			type: "Show",
			element: current,
			visibility: "display"
		});
		effects.push({
			type: "FadeIn",
			element: current+"_content",
			duration: 0.5,
			visibility: "display"
		});
		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "Switch content",
			debug: this.debug,
			effects: effects
		});
		this.previous = current;
	};
	
	this.switchContent = function(current, tab, path, file)
	{
		var state;

		this.setContent(current);
		if(typeof path === "string"
		&& typeof history.pushState === "function")
		{
			state = { "switchTab": tab, "switchContent": path };
			if(file)
			{
				state.switchFile = file;
			}
			history.pushState(state, "", "#" + tab + (path.length ? "/" + path : "") + (file ? "/" + file : ""));
		}
	};

	this.loadFile = function(file, tab, path, callback)
	{
		var o = this, lc, oldLoadingIcon, a;

		oldLoadingIcon = document.getElementById(this.loadingElement).innerHTML;
		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "Loading",
			debug: this.debug,
			effects: [
				{
					type: "CancelAnimation",
					animation: "Stop loading"
				},
				{
					type: "Hide",
					element: this.loadingElement,
					duration: 0.25,
					visibility: "visibility"
				},
				{
					type: "ReplaceContent",
					element: this.loadingElement,
					content: this.loadingIcon
				},
				{
					type: "FadeIn",
					element: this.loadingElement,
					duration: 0.25,
					visibility: "visibility"
				}
			]
		});
		lc = new ML.content.ajaxLoadContent();
		return !lc.loadContent("/browse/file/" + file + "/format/" + this.fileFormat + ".html", function(lc, response) {
			var sb, b;

			if(!response.header)
			{
				window.location.href = "/browse/file/" + file + ".html";
			}
			else
			{
				o.loadedFile = file;
				b = new ML.Animation.Animate();
				b.addAnimation({
					name: "Stop loading",
					debug: o.debug,
					effects: [
						{
							type: "ReplaceContent",
							element: o.fileData,
							content: response.body
						},
						{
							type: "CancelAnimation",
							animation: "Loading"
						},
						{
							type: "Hide",
							element: o.loadingElement,
							duration: 0.25,
							visibility: "visibility"
						},
						{
							type: "ReplaceContent",
							element: o.loadingElement,
							content: oldLoadingIcon
						},
						{
							type: "FadeIn",
							element: o.loadingElement,
							duration: 0.25,
							visibility: "visibility"
						}
					]
				});
				o.switchContent(o.fileData, tab, path, file);
				if(response.header.scrollContents)
				{
					sb = new ML.content.scrollbarToTop();
					sb.tabIndex = -1;
					sb.addTopScrollbar(response.header.scrollContents);
				}
				if(callback)
				{
					callback();
				}
			}
		}, function(lc) {
			if(console && console.log)
			{
				console.log(lc.error);
			}
			window.location.href = "/browse/file/" + file + ".html";
		});
	};
};

var NavigationBar = function(initial, prefix, current, tabPrefix, parentScrollSwitch)
{
	this.currentTab = (typeof current === "string" ? current : "information");
	this.prefix = (prefix || "");
	this.initialTab = initial;
	this.tabPrefix = (tabPrefix || "");
	this.parentScrollSwitch = (parentScrollSwitch || null);

	this.scrollTab = function(tab)
	{
		var parent, container, parentPosition, containerPosition;

		if(this.parentScrollSwitch)
		{
			parent = document.getElementById(this.parentScrollSwitch);
			parentPosition = ML.Animation.Utility.getElementPosition(parent);
			container = document.getElementById(this.prefix + "content_" + tab);
			containerPosition = ML.Animation.Utility.getElementPosition(container);
			parent.scrollTop = containerPosition.y - parentPosition.y;
		}
	};

	this.setTab = function(tab)
	{
		var tabContainer, effects, a;

		if(this.currentTab === tab)
		{
			return true;
		}
		tabContainer = document.getElementById(this.prefix + "tab_" + tab);
		if(!tabContainer)
		{
			return false;
		}
		if(this.parentScrollSwitch)
		{
			this.scrollTab(tab);
			if(this.currentTab.length)
			{
				document.getElementById(this.prefix + "tab_" + this.currentTab).className = "nbtu";
			}
		}
		else
		{
			effects = [];
			if(this.currentTab.length)
			{
				document.getElementById(this.prefix + "tab_" + this.currentTab).className = "nbtu";
				document.getElementById(this.prefix + "content_" + this.currentTab).className = "dynamicHide";
				effects[effects.length] = {
					type: "Hide",
					element: this.prefix + "content_" + this.currentTab,
					visibility: "display"
				};
			}
			effects[effects.length] = {
				type: "CancelAnimation",
				animation: this.prefix + "Fade tab"
			};
			effects[effects.length] = {
				type: "FadeIn",
				element: this.prefix + "content_" + tab,
				duration: 0.25,
				visibility: "display"
			};
			a=new ML.Animation.Animate();
			a.addAnimation({
				name: this.prefix + "Fade tab",
				effects: effects
			});
			document.getElementById(this.prefix + "content_" + tab).className = "";
		}
		tabContainer.className = "nblu";
		this.currentTab = tab;
		return true;
	};

	this.switchTab = function(tab, content)
	{
		var state;

		if(this.setTab(tab)
		&& typeof history.pushState === "function")
		{
			state = { "switchTab": this.tabPrefix + tab };
			if(content)
			{
				state.switchContent = content;
			}
			history.pushState(state, "", "#" + this.tabPrefix + tab);
		}
	};

	this.setTab(initial);
};

var ViewScreenshots = function()
{
	this.lastScreenshot = null;
	this.screenshots = {};

	this.displayScreenshot = function(screenshot)
	{
		var effects, a;

		if(this.screenshots[screenshot] === undefined)
		{
			return false;
		}
		effects = [];
		if(this.lastScreenshot !== null)
		{
			effects.push({
				type: "FadeOut",
				element: "screenshot_view_content",
				duration: 0.25,
				visibility: "display"
			});
		}
		effects.push({
			type: "ReplaceContent",
			content: this.screenshots[screenshot],
			element: "screenshot_view"
		});
		if(this.lastScreenshot === null)
		{
			effects.push({
				type: "Hide",
				element: "screenshot_view_content",
				visibility: "display"
			});
			effects.push({
				type: "FadeOut",
				element: "screenshots_list",
				duration: 0.25,
				visibility: "display"
			});
			effects.push({
				type: "FadeIn",
				element: "screenshot_view",
				duration: 0.25,
				visibility: "display"
			});
		}
		effects.push({
			type: "FadeIn",
			element: "screenshot_view_content",
			duration: 0.25,
			visibility: "display"
		});
		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "View screenshot",
			effects: effects
		});
		this.lastScreenshot = screenshot;
		return true;
	};
	
	this.viewScreenshot = function(screenshot)
	{
		var state;

		if(!this.displayScreenshot(screenshot))
		{
			return false;
		}
		if(typeof history.pushState === "function")
		{
			state = { "switchTab": "screenshots", "switchScreenshot": screenshot };
			history.pushState(state, "", "#screenshots/screenshot/" + screenshot);
		}
		return true;
	};

	this.hideScreenshot = function()
	{
		var effects, a;

		if(this.lastScreenshot === null)
		{
			return true;
		}
		effects = [
			{
				type: "FadeOut",
				element: "screenshot_view",
				duration: 0.25,
				visibility: "display"
			},
			{
				type: "FadeIn",
				element: "screenshots_list",
				duration: 0.25,
				visibility: "display"
			}
		];
		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "Close screenshot",
			effects: effects
		});
		this.lastScreenshot = null;
		return true;
	};

	this.closeScreenshot = function()
	{
		var state;

		if(this.hideScreenshot())
		{
			if(typeof history.pushState === "function")
			{
				state = { "switchTab": "screenshots" };
				history.pushState(state, "", "#screenshots");
			}
		}
	};
};

var ViewVideos = function()
{
	this.lastVideo = null;
	this.videos = {};
	this.loadingIcon = "";
	this.stateContext = "video";
	this.debug = 0;

	this.displayVideo = function(video, videoPackage, callback)
	{
		var lc, o, loadingIcon, a;

		if(this.videos[video] === undefined)
		{
			return false;
		}
		loadingIcon = document.getElementById("loading_video").innerHTML;
		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "Loading video",
			debug: this.debug,
			effects: [
				{
					type: "CancelAnimation",
					animation: "Stop loading video"
				},
				{
					type: "Hide",
					element: "loading_video",
					duration: 0.25,
					visibility: "visibility"
				},
				{
					type: "ReplaceContent",
					element: "loading_video",
					content: this.loadingIcon
				},
				{
					type: "FadeIn",
					element: "loading_video",
					duration: 0.25,
					visibility: "visibility"
				}
			]
		});
		o = this;
		lc = new ML.content.ajaxLoadContent();
		return lc.loadContent("/browse/video/" + video + "/package/" + videoPackage + "/format/content.html", function(lc, response) {
			var effects, b;

			if(!response.header)
			{
				window.location.href = "/browse/video/" + video + "/package/" + videoPackage + ".html";
			}
			else
			{
				effects = [
					{
						type: "CancelAnimation",
						animation: "Loading video"
					},
					{
						type: "Hide",
						element: "loading_video",
						duration: 0.25,
						visibility: "visibility"
					},
					{
						type: "ReplaceContent",
						element: "loading_video",
						content: loadingIcon
					},
					{
						type: "FadeIn",
						element: "loading_video",
						duration: 0.25,
						visibility: "visibility"
					}
				];
				if(o.lastVideo !== null)
				{
					effects.push({
						type: "FadeOut",
						element: "screenshot_view_content",
						duration: 0.25,
						visibility: "display"
					});
				}
				effects.push({
					type: "ReplaceContent",
					content: o.videos[video],
					element: "screenshot_view"
				});
				effects.push({
					type: "ReplaceContent",
					content: response.body,
					element: "video_view"
				});
				if(o.lastVideo === null)
				{
					effects.push({
						type: "Hide",
						element: "screenshot_view_content",
						visibility: "display"
					});
					effects.push({
						type: "FadeOut",
						element: "screenshots_list",
						duration: 0.25,
						visibility: "display"
					});
					effects.push({
						type: "FadeIn",
						element: "screenshot_view",
						duration: 0.25,
						visibility: "display"
					});
				}
				effects.push({
					type: "FadeIn",
					element: "screenshot_view_content",
					duration: 0.25,
					visibility: "display"
				});
				b = new ML.Animation.Animate();
				b.addAnimation({
					name: "Stop loading video",
					effects: effects
				});
				o.lastVideo = video;
				if(callback)
				{
					callback();
				}
			}
		}, function(error) {
			console.log(error);
			window.location.href = "/browse/video/" + video + "/package/" + videoPackage + ".html";
		});
	};

	this.viewVideo = function(video, videoPackage)
	{
		var o = this;

		return this.displayVideo(video, videoPackage, function() {
			var state;

			if(typeof history.pushState === "function")
			{
				state = { "switchTab": "screenshots", videoPackage: videoPackage };
				switch(o.stateContext)
				{
					case "video":
						state.switchVideo = video;
						break;
					case "slides":
						state.switchSlides = video;
						break;
				}
				history.pushState(state, "", "#screenshots/" + o.stateContext + "/" + video);
			}
		});
	};

	this.hideVideo = function()
	{
		var effects, a;

		if(this.lastVideo === null)
		{
			return true;
		}
		effects = [
			{
				type: "FadeOut",
				element: "screenshot_view",
				duration: 0.25,
				visibility: "display"
			},
			{
				type: "FadeIn",
				element: "screenshots_list",
				duration: 0.25,
				visibility: "display"
			}
		];
		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "Close screenshot",
			effects: effects
		});
		this.lastVideo = null;
		return true;
	};

	this.closeVideo = function()
	{
		var state;

		if(this.hideVideo())
		{
			if(typeof history.pushState === "function")
			{
				state = { "switchTab": "screenshots" };
				history.pushState(state, "", "#screenshots");
			}
		}
	};
};

var nav, allTabs, nb, db, vc, vs, vu;

var Navigation = function()
{
	this.loadingIcon = "";
	this.rateIcon = "";
	this.loadedRating = false;
	this.ratingForm = "";
	this.ratingFormSubmit = "";
	this.loadedInstall = false;
	this.installIcon = "";
	this.package = 0;
	this.reputationLabel = "";
	this.downloadLabel = "";
	this.ratingsLabel = "";
	this.neededPackagesLabel = "";
	this.downloadRankingsLabel = "";
	this.linksLabel = "";
	this.debug = 0;
	this.tabs = [];
	this.tabsContainer = "";

	this.getPath = function(path, paths)
	{
		var slash, parent;

		if(paths
		&& typeof paths[path] === "boolean")
		{
			return { parent: path };
		}
		slash = path.indexOf("/");
		if(slash === -1)
		{
			return {};
		}
		parent = path.substr(0, slash);
		if(paths
		&& typeof paths[parent] !== "boolean")
		{
			return {};
		}
		return { parent: parent, child: path.substr(slash + 1) };
	};

	this.getLastPath = function(path, paths)
	{
		var slash, parent, child;

		if(typeof paths[path] === "object")
		{
			return { parent: path };
		}
		slash = path.lastIndexOf("/");
		if(slash !== -1)
		{
			parent = path.substr(0, slash);
			if(typeof paths[parent] === "object")
			{
				child = path.substr(slash + 1);
				if(typeof paths[parent][child] === "number")
				{
					return { parent: parent, child: child };
				}
				return { parent: parent };
			}
		}
		if(typeof paths[path] === "object")
		{
			return { parent: path };
		}
		return {};
	};

	this.switchRatings = function()
	{
		var a, o = this;

		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "Switch ratings",
			debug: this.debug,
			effects: [
				{
					type: "MakeVisible",
					duration: 0.5,
					element: "reputation_label"
				},
				{
					type: "ReplaceContent",
					content: this.reputationLabel,
					element: "reputation_label"
				},
				{
					type: "Emphasize",
					method: "circle",
					duration: 0.5,
					element: "reputation_label",
					canvas: "reputation_emphasis",
					strokeStyle: "#ff8000",
					opacity: 0.9
				},
				{
					type: "Wait",
					duration: 2
				},
				{
					type: "FadeOut",
					element: "reputation_emphasis",
					duration: 1
				}
			]
		});
		setTimeout(function()
		{
			var b;

			nb.switchTab("reputation");
			b = new ML.Animation.Animate();
			b.addAnimation({
				name: "Switch ratings",
				debug: o.debug,
				effects: [
					{
						type: "ReplaceContent",
						content: o.ratingsLabel,
						element: "user_ratings_label"
						
					},
					{
						type: "Wait",
						duration: 1
					},
					{
						type: "MakeVisible",
						duration: 0.5,
						element: "user_ratings_label"
					},
					{
						type: "Emphasize",
						method: "circle",
						duration: 1.0,
						element: "user_ratings_label",
						canvas: "user_ratings_label_emphasis",
						strokeStyle: "#ff8000",
						opacity: 0.9
					},
					{
						type: "MakeVisible",
						duration: 0.5,
						element: "user_ratings"
					},
					{
						type: "Emphasize",
						method: "double-underline",
						duration: 0.5,
						element: "user_ratings_overall",
						canvas: "user_ratings_overall_emphasis",
						strokeStyle: "#ff8000",
						opacity: 0.9
					},
					{
						type: "Wait",
						duration: 5
					},
					{
						type: "FadeOut",
						element: "user_ratings_label_emphasis",
						duration: 1
					},
					{
						type: "FadeOut",
						element: "user_ratings_overall_emphasis",
						duration: 1
					}
				]
			});
		}, 1000);
		return true;
	};

	this.switchRankings = function()
	{
		var a, o = this;

		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "Switch ratings",
			debug: this.debug,
			effects: [
				{
					type: "MakeVisible",
					duration: 0.5,
					element: "reputation_label"
				},
				{
					type: "ReplaceContent",
					content: this.reputationLabel,
					element: "reputation_label"
				},
				{
					type: "Emphasize",
					method: "circle",
					duration: 0.5,
					element: "reputation_label",
					canvas: "reputation_emphasis",
					strokeStyle: "#ff8000",
					opacity: 0.9
				},
				{
					type: "Wait",
					duration: 2
				},
				{
					type: "FadeOut",
					element: "reputation_emphasis",
					duration: 1
				}
			]
		});
		setTimeout(function()
		{
			var b;

			nb.switchTab("reputation");
			b = new ML.Animation.Animate();
			b.addAnimation({
				name: "Switch ratings",
				debug: o.debug,
				effects: [
					{
						type: "ReplaceContent",
						content: o.downloadRankingsLabel,
						element: "download_rankings_label"
						
					},
					{
						type: "Wait",
						duration: 1
					},
					{
						type: "MakeVisible",
						duration: 0.5,
						element: "download_rankings_label"
					},
					{
						type: "Emphasize",
						method: "circle",
						duration: 1.0,
						element: "download_rankings_label",
						canvas: "download_rankings_label_emphasis",
						strokeStyle: "#ff8000",
						opacity: 0.9
					},
					{
						type: "Wait",
						duration: 5
					},
					{
						type: "FadeOut",
						element: "download_rankings_label_emphasis",
						duration: 1
					}
				]
			});
		}, 1000);
		return true;
	};

	this.switchReuses = function()
	{
		var a, o = this;

		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "Switch ratings",
			debug: this.debug,
			effects: [
				{
					type: "MakeVisible",
					duration: 0.5,
					element: "reuses_label"
				},
				{
					type: "ReplaceContent",
					content: this.linksLabel,
					element: "links_label"
					
				},
				{
					type: "Emphasize",
					method: "circle",
					duration: 0.5,
					element: "links_label",
					canvas: "links_emphasis",
					strokeStyle: "#ff8000",
					opacity: 0.9
				},
				{
					type: "Wait",
					duration: 2
				},
				{
					type: "FadeOut",
					element: "links_emphasis",
					duration: 1
				}
			]
		});
		setTimeout(function()
		{
			var b;

			nb.switchTab("links");
			b = new ML.Animation.Animate();
			b.addAnimation({
				name: "Switch ratings",
				debug: o.debug,
				effects: [
					{
						type: "ReplaceContent",
						content: o.ratingsLabel,
						element: "user_ratings_label"
					},
					{
						type: "MakeVisible",
						duration: 0.5,
						element: "reuses_label"
					},
					{
						type: "Emphasize",
						method: "circle",
						duration: 1.0,
						element: "reuses_label",
						canvas: "reuses_label_emphasis",
						strokeStyle: "#ff8000",
						opacity: 0.9
					},
					{
						type: "MakeVisible",
						duration: 1,
						element: "reuses"
					},
					{
						type: "Wait",
						duration: 5
					},
					{
						type: "FadeOut",
						element: "reuses_label_emphasis",
						duration: 1
					}
				]
			});
		}, 1000);
		return true;
	};

	this.switchDependency = function()
	{
		var a, o = this;

		a = new ML.Animation.Animate();
		a.addAnimation({
			name: "Switch dependency",
			debug: this.debug,
			effects: [
				{
					type: "MakeVisible",
					duration: 0.5,
					element: "download_label"
				},
				{
					type: "ReplaceContent",
					content: this.downloadLabel,
					element: "download_label"
				},
				{
					type: "Emphasize",
					method: "circle",
					duration: 0.5,
					element: "download_label",
					canvas: "download_emphasis",
					strokeStyle: "#ff8000",
					opacity: 0.9
				},
				{
					type: "Wait",
					duration: 2
				},
				{
					type: "FadeOut",
					element: "download_emphasis",
					duration: 1
				}
			]
		});
		setTimeout(function()
		{
			var b;

			nb.switchTab("download");
			b = new ML.Animation.Animate();
			b.addAnimation({
				name: "Switch dependency",
				debug: o.debug,
				effects: [
					{
						type: "ReplaceContent",
						content: o.neededPackagesLabel,
						element: "needed_packages_label"
						
					},
					{
						type: "Wait",
						duration: 1
					},
					{
						type: "MakeVisible",
						duration: 0.5,
						element: "needed_packages_label"
					},
					{
						type: "Emphasize",
						method: "circle",
						duration: 1.0,
						element: "needed_packages_label",
						canvas: "needed_packages_label_emphasis",
						strokeStyle: "#ff8000",
						opacity: 0.9
					},
					{
						type: "Wait",
						duration: 5
					},
					{
						type: "FadeOut",
						element: "needed_packages_label_emphasis",
						duration: 1
					},
				]
			});
		}, 1000);
		return true;
	};

	this.closeRating = function()
	{
		var a;

		if(this.loadedRating)
		{
			a = new ML.Animation.Animate();
			a.addAnimation({
				name: "Unload rating",
				debug: this.debug,
				effects: [
					{
						type: "CancelAnimation",
						animation: "Load rating"
					},
					{
						type: "SlideOut",
						duration: 0.5,
						element: "rating",
						edge: "top"
					},
					{
						type: "ReplaceContent",
						content: "",
						element: "rating_content"
						
					},
					{
						type: "Hide",
						element: "rating",
						visibility: "display"
					},
					{
						type: "Hide",
						element: "loading_rate",
						duration: 0.25,
						visibility: "visibility"
					},
					{
						type: "ReplaceContent",
						element: "loading_rate",
						content: this.rateIcon
					},
					{
						type: "FadeIn",
						element: "loading_rate",
						duration: 0.25,
						visibility: "visibility"
					}
				]
			});
			this.loadedRating = false;
		}
	};

	this.loadRating = function(ratingPackage, callback)
	{
		var lc, o = this;

		if(this.loadedRating)
		{
			this.closeRating();
			return true;
		}
		document.getElementById("loading_rate").innerHTML = this.loadingIcon;
		lc = new ML.content.ajaxLoadContent();
		return lc.loadContent("/rate.html?package=" + ratingPackage + "&format=content", function(lc, response) {
			var a, effects;

			if(!response.header)
			{
				window.location.href = "/rate.html?package=" + ratingPackage;
			}
			else
			{
				lc.loadCode("rating_content", response.body);
				effects = [
					{
						type: "SlideIn",
						duration: 0.5,
						element: "rating",
						edge: "top"
					},
					{
						type: "MakeVisible",
						duration: 0.5,
						element: "rating"
					}
				];
				if(typeof response.header.title === "string")
				{
					effects.push({
						type: "Emphasize",
						method: "double-underline",
						duration: 1,
						element: response.header.title,
						canvas: "title_emphasis",
						strokeStyle: "#ff8000",
						opacity: 0.9
					});
				}
				effects.push({
					type: "Hide",
					element: "loading_rate",
					duration: 0.25,
					visibility: "visibility"
				});
				effects.push({
					type: "ReplaceContent",
					element: "loading_rate",
					content: o.rateIcon
				});
				if(callback)
				{
					effects.push({
						type: "Callback",
						callback: callback
					});
				}
				effects.push({
					type: "FadeIn",
					element: "loading_rate",
					duration: 0.25,
					visibility: "visibility"
				});
				effects.push({
					type: "Wait",
					duration: 5
				});
				if(typeof response.header.title === "string")
				{
					effects.push({
						type: "FadeOut",
						element: "title_emphasis",
						duration: 1
					});
				}
				a = new ML.Animation.Animate();
				a.addAnimation({
					name: "Load rating",
					debug: o.debug,
					effects: effects
				});
				o.loadedRating = true;
				if(typeof response.header.form === "string")
				{
					o.ratingForm = response.header.form;
					o.ratingFormSubmit = response.header.submit;
				}
			}
		}, function(lc) {
			if(console && console.log)
			{
				console.log(lc.error);
			}
			window.location.href = "/rate.html?package=" + ratingPackage;
		});
	};
	
	this.submitRating = function()
	{
		var lc, b, o = this, effects;

		document.getElementById("loading_rate").innerHTML = this.loadingIcon;
		lc = new ML.content.ajaxLoadContent();
		return lc.submitForm(this.ratingForm, this.ratingFormSubmit, function(lc, response) {
			if(!response.header
			|| typeof response.header.rated !== "boolean")
			{
				window.location.href = "/rate.html?package=" + o.package;
			}
			else
			{
				if(typeof response.header.rated === "boolean")
				{
					effects = [
						{
							type: "CancelAnimation",
							animation: "Load rating"
						},
						{
							type: "FadeOut",
							duration: 0.5,
							element: "rating_content",
							edge: "top"
						},
						{
							type: "ReplaceContent",
							element: "rating_content",
							content: response.body
						},
						{
							type: "FadeIn",
							duration: 0.5,
							element: "rating_content"
						},
						{
							type: "ReplaceContent",
							element: "loading_rate",
							content: o.rateIcon
						},
						{
							type: "FadeIn",
							element: "loading_rate",
							duration: 0.25,
							visibility: "visibility"
						}
					];
				}
				else
				{
					effects = [
						{
							type: "CancelAnimation",
							animation: "Load rating"
						},
						{
							type: "SlideOut",
							duration: 0.5,
							element: "rating_content",
							edge: "top"
						},
						{
							type: "ReplaceContent",
							element: "rating_content",
							content: ""
						},
						{
							type: "SlideIn",
							duration: 0.1,
							element: "rating_content",
							edge: "top"
						},
						{
							type: "Hide",
							duration: 0.1,
							element: "rating_content"
						},
						{
							type: "ReplaceContent",
							element: "rating_content",
							content: response.body
						},
						{
							type: "FadeIn",
							duration: 0.5,
							element: "rating_content"
						},
						{
							type: "ReplaceContent",
							element: "loading_rate",
							content: o.rateIcon
						},
						{
							type: "FadeIn",
							element: "loading_rate",
							duration: 0.25,
							visibility: "visibility"
						}
					];
				}
				b = new ML.Animation.Animate();
				b.addAnimation({
					name: "Rating submitted",
					debug: o.debug,
					effects: effects
				});
			}
		}, function(lc) {
			if(console && console.log)
			{
				console.log(lc.error);
			}
			window.location.href = "/rate.html?package=" + o.package;
		});
	};

	this.loadInstall = function(installPackage)
	{
		var lc, o = this;

		if(this.loadedInstall)
		{
			this.closeInstall();
			return true;
		}
		document.getElementById("loading_install").innerHTML = this.loadingIcon;
		lc = new ML.content.ajaxLoadContent();
		return lc.loadContent("/package_repositories.html?package=" + installPackage + "&format=content", function(lc, response) {
			var a, effects;

			if(!response.header)
			{
				window.location.href = "/package_repositories.html?package=" + installPackage;
			}
			else
			{
				lc.loadCode("install_content", response.body);
				effects = [
					{
						type: "SlideIn",
						duration: 0.5,
						element: "install",
						edge: "top"
					},
					{
						type: "MakeVisible",
						duration: 0.5,
						element: "install"
					}
				];
				if(typeof response.header.title === "string")
				{
					effects.push({
						type: "Emphasize",
						method: "double-underline",
						duration: 1,
						element: response.header.title,
						canvas: "title_emphasis",
						strokeStyle: "#ff8000",
						opacity: 0.9
					});
				}
				effects.push({
					type: "Hide",
					element: "loading_install",
					duration: 0.25,
					visibility: "visibility"
				});
				effects.push({
					type: "ReplaceContent",
					element: "loading_install",
					content: o.installIcon
				});
				effects.push({
					type: "FadeIn",
					element: "loading_install",
					duration: 0.25,
					visibility: "visibility"
				});
				effects.push({
					type: "Wait",
					duration: 5
				});
				if(typeof response.header.title === "string")
				{
					effects.push({
						type: "FadeOut",
						element: "title_emphasis",
						duration: 1
					});
				}
				a = new ML.Animation.Animate();
				a.addAnimation({
					name: "Load install",
					debug: o.debug,
					effects: effects
				});
				o.loadedInstall = true;
			}
		}, function(lc) {
			if(console && console.log)
			{
				console.log(lc.error);
			}
			window.location.href = "/package_repositories.html?package=" + installPackage;
		});
	};
	
	this.closeInstall = function()
	{
		var a;

		if(this.loadedInstall)
		{
			a = new ML.Animation.Animate();
			a.addAnimation({
				name: "Unload install",
				debug: this.debug,
				effects: [
					{
						type: "CancelAnimation",
						animation: "Load install"
					},
					{
						type: "SlideOut",
						duration: 0.5,
						element: "install",
						edge: "top"
					},
					{
						type: "ReplaceContent",
						content: "",
						element: "install_content"
						
					},
					{
						type: "Hide",
						element: "install",
						visibility: "display"
					},
					{
						type: "Hide",
						element: "loading_install",
						duration: 0.25,
						visibility: "visibility"
					},
					{
						type: "ReplaceContent",
						element: "loading_install",
						content: this.installIcon
					},
					{
						type: "FadeIn",
						element: "loading_install",
						duration: 0.25,
						visibility: "visibility"
					}
				]
			});
			this.loadedInstall = false;
		}
	};

	this.fixTabsHeight = function()
	{
		var t, e, m, h, d, s, elements;

		m = 0;
		elements = [];
		for(t = 0; t < this.tabs.length; t++)
		{
			elements[t] = e = document.getElementById(this.tabs[t]);
			if(!e)
				return false;
			s = (window.getComputedStyle ? window.getComputedStyle(e,null) : e.style);
			d = s.display;
			if(d === 'none')
			{
				e.style.visibility = 'hidden'
				e.style.display = 'block'
			}
			h = (e.innerHeight ? e.innerHeight : (e.clientHeight ? e.clientHeight : e.offsetHeight));
			if(d === 'none')
			{
				e.style.display = d
				e.style.visibility = ''
			}
			if(h > m)
				m = h;
		}
		for(t = 0; t < this.tabs.length; t++)
		{
			elements[t].style.minHeight = m + "px";
		}
		e = document.getElementById(this.tabsContainer);
		e.style.height = m + "px";
		e.style.overflow = "hidden";
		return true;
	};

	this.loadFile = function(view, bar, file, tab, path, tabScroll)
	{
		var nav = this;

		return view.loadFile(file, tab, path, function()
			{
				nav.fixTabsHeight();
				if(tabScroll)
				{
					bar.scrollTab(tabScroll);
				}
			}
		);
		
	};

	window.onpopstate = function(event)
	{
		var path;

		if(event.state !== null)
		{
			if(typeof event.state.switchTab === "string")
			{
				path = nav.getPath(event.state.switchTab, allTabs);
				if(path.parent)
				{
					nb.setTab(path.parent);
					if(path.child)
					{
						db.setTab(path.child);
					}
				}
			}
			if(typeof event.state.switchContent === "string")
			{
				vc.setContent(event.state.switchContent);
			}
			if(typeof event.state.switchFile === "number")
			{
				nav.loadFile(vc, nb, event.state.switchFile, "view_files", null, "view_files");
			}
			if(typeof event.state.switchScreenshot === "string")
			{
				vs.displayScreenshot(event.state.switchScreenshot);
			}
			else
			{
				if(typeof event.state.switchTab === "string"
				&& event.state.switchTab === "screenshots")
				{
					vs.hideScreenshot();
				}
			}
			if(typeof event.state.switchVideo === "string")
			{
				vv.displayVideo(event.state.switchVideo, event.state.videoPackage);
			}
			else
			{
				if(typeof event.state.switchTab === "string"
				&& event.state.switchTab === "screenshots")
				{
					vv.hideVideo();
				}
			}
			if(typeof event.state.switchSlides === "string")
			{
				vsl.displayVideo(event.state.switchSlides, event.state.videoPackage);
			}
			else
			{
				if(typeof event.state.switchTab === "string"
				&& event.state.switchTab === "screenshots")
				{
					vsl.hideVideo();
				}
			}
		}
		else
		{
			nb.setTab(nb.initialTab);
		}
	};
};
