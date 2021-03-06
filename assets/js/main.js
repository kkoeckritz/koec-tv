let generic = {
	routeList: [],
	isInView: (e) => {
		if (typeof jQuery === "function" && e instanceof jQuery) {
			el = el[0];
		}
		let rect = e.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	},

	buildRouteList: () => {
		$(".hasLaunch").each((i, el) => {
			console.log($(el).data("launch"));
			generic.routeList.push($(el).data("launch"));
		});
	},

	getRoute: (routeList) => {
    const fullRoute = window.location.pathname;
    const reqRoute = fullRoute.slice(1);

    if (routeList.indexOf(reqRoute) !== -1) {
      return reqRoute;
    } else {
      return null;
    }
  },

	prepareDesktop: () => {
		$(".blank").fadeOut(1000);
		$(".desktop").hide();
		$(".assistantTyper").hide();
		$(".contextShell").hide();
		$(".windowModule").hide();
		$(".windowShell").hide();
	},

	doneLoading: () => {
		$(".preloaderText").text("WELCOME");
		$(".preloaderDotZone").addClass("hide");
		$(".preloader").fadeOut(1000).promise().done(() => {
			$(".desktop").fadeIn(500);
		});

		// open module specified by client route
		generic.buildRouteList();
		setTimeout(() => {
			const initialRoute = generic.getRoute(generic.routeList);
			if (initialRoute) {
				windowShell.launchModule(initialRoute);
			} else {
			}
		}, 1500);
		$(".webcamLight").addClass("webcamLit");
	}
};

let screen = {
	setPower: () => {
		$(".powerButton").click(() => {
			$(".blank").toggle();
			$(".powerButton").toggleClass("pressed")
			$(".powerButtonLight").toggleClass("powerLit");
			$(".webcamLight").toggleClass("webcamLit");
		});
	}
};

let desktop = {
	waitTime: null,
	descInt: null,
	selectedText: "",
	cannedPhrases: [
		"Want to get in touch? Click here to find out how.",
		"Hey... uh, wake me up in a minute, will ya?"
	],

	setContextControls: () => {
		$(".imgPreview").click((e) => {
			let newBg = $(e.target).data("img");
			$(".desktop").css("background-image", `var(--img-bg-${newBg})`);
			$(".imgPreview").removeClass("isSet");
			$(e.target).addClass("isSet");
		});

		// set .optionBox defaults
		$(".optionBox[data-option='0']").prop("checked", "true");

		$(".optionBox").change((e) => {
			let optNum = $(e.target).data("option");
			if (optNum === 0) {
				console.log("> correct box!");
				if ($(e.target).is(":checked")) {
					$(".desktop").removeClass("noTrans");
				} else {
					$(".desktop").addClass("noTrans");
				}
			} else {
				console.log("wrong box!");
			}
		});
	},

	buildSelectionMenu: () => {
		// add text to top

		/* build links to...
		   - MDN
			 - Stack Overflow
			 - Scotch ?
			 - Smashing Magazine
			 - CSS Tricks
			 - YouTube
		*/
	},

	// GET ON IT!
	setTextSelection: () => {
		document.onselectionchange = () => {
			desktop.selectedText = window.getSelection().toString();
			console.log(desktop.selectedText);
		};
	},

	setContextMenus: () => {
		$shell = $(".contextShell");
		
		$(".hasContext").contextmenu((e) => {
			let $curMenu = null;

			e.stopImmediatePropagation();
			e.preventDefault();
			$(".contextMenu").hide();
			
			// intercept context event & deploy custom menu
			if (desktop.selectedText.length) {
				desktop.buildSelectionMenu();
				$curMenu = $("[data-menu='selection']");
			} else if ($(e.target).closest(".windowShell").length) {
				$curMenu = $("[data-menu='window']");
			} else {
				$curMenu = $("[data-menu='desktop']");
			}

			$curMenu.show();
			$shell.css({top: e.clientY, left: e.clientX});
			$shell.show();
			
			// allow click elsewhere to close menu
			$(".desktop").on("mousedown", (e) => {
				if (!($(e.target).closest(".contextShell").length)) {
					$shell.hide();
				}
			});

			return false;
		});
	},

	printDesc: (descText) => {
		const $desc = $(".assistantText");
		let i = 0;
		
		// print desc one letter at a time
		$desc.text("");
		$desc.addClass("typing");	
		desktop.descInt = setInterval(() => {
			let curDesc = $desc.text();
			if (curDesc != descText) {
				$desc.text(curDesc + Array.from(descText)[i]);
			} else {
				clearInterval(desktop.descInt);
				$desc.removeClass("typing");
				$desc.addClass("doneTyping");
			}
			i++;
		}, 25);
	},

	setTyper: () => {
		$(".hasDesc").hover((e) => {
			const $typer = $(".assistantTyper");
			const $desc = $(".assistantText");
			let descText = null;

			// raise opacity on assistant
			$typer.stop().show();
			$desc.removeClass("typing");
			$desc.removeClass("doneTyping");
			$typer.css("opacity", "1");
			$desc.text("…");
			$(".assistant").addClass("focused");

			// print given string or random phrase
			if ($(e.target).data("desc")) {
				descText = $(e.target).data("desc");
			}
			else {
				descText = desktop.cannedPhrases[Math.floor(Math.random() * desktop.cannedPhrases.length)];
			}

			// wait, then print desc
			desktop.waitTime = setTimeout(() => {
				desktop.printDesc(descText);
			}, 750);
			
		}, (e) => {
			// clear assistant
			const $typer = $(".assistantTyper");
			const $desc = $(".assistantText");
			clearTimeout(desktop.waitTime);
			clearInterval(desktop.descInt);
			$typer.stop().fadeOut(200).promise().done(() => {
				$desc.text("");
				$desc.removeClass("typing");
				$desc.removeClass("doneTyping");
			});
			$(".assistant").removeClass("focused");
		});
	},

	setToggler: () => {
		// show dock when toggler clicked
		$(".dockToggler").click(() => {
			$(".dockToggler").addClass("dockTogglerHidden");
			$(".dock").removeClass("dockHidden");

			// show toggler once mouse leaves dock
			$(".dock").mouseleave(() => {
				$(".dockToggler").removeClass("dockTogglerHidden");
				$(".dock").addClass("dockHidden");
				$(".dock").off("mouseleave");
			})
		});
	}
};

let windowShell = {
	closeTime: null,

	configureWindow: (windowModule) => {
			// check if shell is maximized but closed and needs dock hidden
			if ($(".windowShell:hidden").length && $(".windowShell").hasClass("shellMaximized")) {
				$(".dock").addClass("dockHidden");
				$(".dockToggler").removeClass("dockTogglerHidden");
			}

			// check if module needs light max button, heading
			if (windowModule.hasClass("hasDarkHeading")) {
				$(":root").css({"--color-max-button": "white", "--color-max-hover": "#ffffff22", "--color-heading": "var(--color-light)"});

			} else {
				$(":root").css({"--color-max-button": "black", "--color-max-hover": "#00000022", "--color-heading": "var(--chosen-fg-color)"})
			}
	},

	// launch linked window module
	launchModule: (moduleName) => {
		const windowModule = $(`[data-window="${moduleName}"]`);

		$(".hasLaunch").removeClass("focused");
		$(`.dockButton[data-launch=${moduleName}]`).addClass("focused")
		clearTimeout(windowShell.closeTime);
		$(".windowModule").hide();

		$(".windowShell").removeClass("closed");
		windowModule.show();
		windowShell.configureWindow(windowModule);
		$(".windowShell").show();
	},

	setLaunchers: () => {
		$(".hasLaunch").click((e) => {
			const moduleName = $(e.target).data("launch");

			windowShell.launchModule(moduleName)
		});
	},

	configureModuleColors: () => {
		for (m of $(".windowModule").toArray()) {
			let colorsArr = $(m).data("colors").toString().split(" ");
			$(m).css({"--color-heading-bg": colorsArr[0], "--color-link-bg": colorsArr[1], "--color-selection-bg": colorsArr[2]});
		}
	},

	setControls: () => {
		// maximize button
		$(".maxButton").click(() => {
			$(".windowShell").toggleClass("shellMaximized");
			$(".windowContent").toggleClass("contentMaximized");
			$(".dock").toggleClass("dockHidden");
			$(".dockToggler").toggleClass("dockTogglerHidden");
		});

		// close button
		$(".closeButton").click(() => {
			$(".windowShell").addClass("closed");
			$(".hasLaunch").removeClass("focused");
			$(".dock").removeClass("dockHidden");
			$(".dockToggler").addClass("dockTogglerHidden");
			windowShell.closeTime = setTimeout(() => {
				$(".windowShell").hide();
			}, 200);
		});
	}
}

let components = {
	setCardClick: () => {
		$(".smCard").click((e) => {
			if ($(e.target).hasClass("chosenCard")) {
				$(e.target).removeClass("chosenCard");
			} else {
				$(".smCard").removeClass("chosenCard");
				$(e.target).addClass("chosenCard");
			}
		});
	}
}

// before content loaded
	generic.prepareDesktop();

// once content loaded
$(window).on("load", () => {
	generic.doneLoading();
	screen.setPower();
	desktop.setTextSelection();
	desktop.setContextMenus();
	desktop.setContextControls();
	desktop.setTyper();
	desktop.setToggler();
	windowShell.setLaunchers();
	windowShell.configureModuleColors();
	windowShell.setControls();
	components.setCardClick();
});
