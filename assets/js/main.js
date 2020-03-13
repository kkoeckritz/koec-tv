let generic = {
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

	prepareDesktop: () => {
		$(".blank").fadeOut(1000);
		$(".desktop").hide();
		$(".assistantTyper").hide();
		$(".contextMenu").hide();
		$(".windowModule").hide();
		$(".windowShell").hide();
	},
	doneLoading: () => {
		$(".preloaderText").text("WELCOME");
		$(".preloaderDotZone").addClass("hide");
		$(".preloader").fadeOut(1000).promise().done(() => {
			$(".desktop").fadeIn(500);
		});

		$(".webcamLight").addClass("blinking");
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
		"Don't mind the look, I'm Kris's assistant.",
		"Click me for more about this site.",
		"I only know a few canned phrases. This is one of them.",
		"I'm paid generously, 20 bones an hour! *crickets*"
	],

	setContextControls: () => {
		$(".imgPreview").click((e) => {
			let newBg = $(e.target).data("img");
			$(".desktop").css("background-image", `var(--img-bg-${newBg})`);

			$(".imgPreview").removeClass("isSet");
			$(e.target).addClass("isSet");
		})
	},

	// setTextSelection: () => {
	// 	$(".windowShell").select(() => {
	// 	});
	// },

	setContextMenus: () => {
		$(".hasContext").contextmenu((e) => {
			let $menuTarget = null;
			let $curMenu = null;
			
			// intercept context event & deploy custom menu
			// IF desktop.textIsSelected...
			if ($(e.target).closest(".windowShell").length) {
				$menuTarget = $(".windowShell");
				$curMenu = $(".windowContext");
			} else {
				$menuTarget = $(".desktop");
				$curMenu = $(".desktopContext");
			}

			e.stopImmediatePropagation();
			e.preventDefault();
			$(".contextMenu").hide();
			$curMenu.css({top: e.clientY, left: e.clientX});
			$curMenu.show();
			
			// allow click elsewhere to close menu
			$(".desktop").on("mousedown", (e) => {
				if (!($(e.target).closest(".contextMenu").length)) {
					$(".contextMenu").hide();
				}
			});

			// call to set up menu listeners
			desktop.setContextControls();

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
				$desc.text(curDesc + [...descText[i]]);
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
			$desc.removeClass("typing");
			$desc.removeClass("doneTyping");
			$typer.stop().fadeOut(100).promise().done(() => {
				$desc.text("");
			});
			$(".assistant").removeClass("focused");
		});
	}
};

let windowShell = {
	closeTime: null,

	setLaunchers: () => {
		$(".hasLaunch").click((e) => {
			let moduleName = $(e.target).data("launch");
			let windowModule = $(`[data-window="${moduleName}"]`);

			$(".hasLaunch").removeClass("focused");
			$(e.target).addClass("focused")
			clearTimeout(windowShell.closeTime);
			$(".windowModule").hide();
			windowModule.show();
			$(".windowShell").removeClass("closed");

			// check if module needs dark max button
			if (windowModule.hasClass("hasDarkHeading")) {
				$(":root").css("--color-max-button", "white");
			} else {
				$(":root").css("--color-max-button", "black");
			}
			
			$(".windowShell").show();
		});
	},

	setControls: () => {
		// maximize button
		$(".maxButton").click(() => {
			$(".windowShell").toggleClass("maximized");
		});

		// close button
		$(".closeButton").click(() => {
			$(".windowShell").addClass("closed");
			$(".hasLaunch").removeClass("focused");
			windowShell.closeTime = setTimeout(() => {
				$(".windowShell").hide();
			}, 200);
		});
	}
}

// before content loaded
	generic.prepareDesktop();

// once content loaded
$(window).on("load", () => {
	generic.doneLoading();
	screen.setPower();
	// desktop.setTextSelection();
	desktop.setContextMenus();
	desktop.setTyper();
	windowShell.setLaunchers();
	windowShell.setControls();
});
