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
		$(".window").hide();
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
	descInt: null,

	setPower: () => {
		$(".powerButton").click(() => {
			$(".blank").toggle();
			$(".powerButton").toggleClass("pressed")
			$(".powerButtonLight").toggleClass("lit");
			$(".webcamLight").toggleClass("blinking");
		});
	}
};

let desktop = {
	setContextMenus: () => {
		$(".hasContext").contextmenu((e) => {
			let $menuTarget = null;
			let $curMenu = null;
			
			// INCLUDE TEXT-SELECTION
			if ($(e.target).hasClass("window")) {
				$menuTarget = $(".window");
				$curMenu = $(".windowContext")
			} else {
				$menuTarget = $(".desktop");
				$curMenu = $(".desktopContext");
			}

			e.stopPropagation();
			e.preventDefault();
			$(".contextMenu").hide();
			$curMenu.css({top: e.clientY, left: e.clientX});
			$curMenu.show();
			
			$(".desktop").on("click", (e) => {
				if (!($(e.target).closest(".contextMenu").length)) {
					e.preventDefault();
					$(".contextMenu").hide();
					$menuTarget.off("click");
				}
			});

			return false;
		});
	},

	setPrintDesc: () => {
		$(".hasDesc").hover((e) => {
			const $typer = $(".assistantTyper");
			const $desc = $(".assistantText");
			let descText = $(e.target).data("desc");
			let i = 0;

			// raise opacity on assistant
			$(".assistant").addClass("focused");
			$typer.stop().show();
			$typer.css("opacity", "1");
			$desc.stop().show();
			$desc.css("opacity", "1");
			$desc.text("");

			// print desc one letter at a time until complete
			screen.descInt = setInterval(() => {
				let curDesc = $desc.text();
				if (curDesc != descText) {
					$desc.text(curDesc + [...descText[i]]);
				} else {
					clearInterval(screen.descInt);
					$desc.removeClass("typing");
					$desc.addClass("doneTyping");
				}
				i++;
			}, 25);
			
		}, (e) => {
			// clear assistant
			clearInterval(screen.descInt);
			const $typer = $(".assistantTyper");
			const $desc = $(".assistantText");
			$desc.removeClass("doneTyping");
			$desc.addClass("typing");
			$desc.fadeOut(250);
			$typer.fadeOut(250).promise().done(() => {
				$desc.text("");
			});
			$(".assistant").removeClass("focused");
		});
	},

	setWindows: () => {
		$(".dockButton").click((e) => {
			let launchWindow = $(e.target).data("launch");
			$(".window").hide();
			$(`[data-window="${launchWindow}"]`).show();
		});
	}
};

let windows = {
	setLaunchers: () => {
		$(".dockButton").click((e) => {
			let launchWindow = $(e.target).data("launch");
			$(".window").hide();
			$(`[data-window="${launchWindow}"]`).show();
		});
	},

	setControls: () => {
		$(".maxButton").click(() => {
			$(".window").toggleClass("maximized");
		});
		$(".closeButton").click(() => {
			$(".window").hide();
		});
	}
}

// before content loaded
$(document).ready(() => {
	generic.prepareDesktop();
})

// once content loaded
$(window).on("load", () => {
	generic.doneLoading();
	screen.setPower();
	desktop.setContextMenus();
	desktop.setPrintDesc();
	windows.setLaunchers();
	windows.setControls();
});
